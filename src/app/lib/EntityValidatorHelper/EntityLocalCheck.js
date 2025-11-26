"use strict";

import { promises as dns } from "dns";
import fs from "fs/promises";
import path from "path";

const rfc5322EmailRegex =
    /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:[\x01-\x08\x0b\x0c\x0e-\x7f]+)\]))$/;

let disposableDomainsCache;
const mxCache = new Map();

async function loadDisposableDomains() {
    if (disposableDomainsCache) return disposableDomainsCache;

    const filePath = path.join(
        process.cwd(),
        "src/app/lib/EntityValidatorHelper/disposableTemporaryDomain.entity"
    );
    const raw = await fs.readFile(filePath, "utf-8");

    const domains = raw
        .split(/[\n,]+/)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);

    disposableDomainsCache = new Set(domains);
    return disposableDomainsCache;
}

function basicSyntaxCheck(email) {
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return false;
    if (localPart.length > 64) return false;
    if (domain.length > 255) return false;
    if (/\.\./.test(localPart)) return false;
    if (/^[.-]|[.-]$/.test(localPart)) return false;
    return true;
}

async function checkDomainMX(domain) {
    if (mxCache.has(domain)) return mxCache.get(domain);

    try {
        const mxRecords = await dns.resolveMx(domain);
        const result = mxRecords && mxRecords.length > 0;
        mxCache.set(domain, result);
        setTimeout(() => mxCache.delete(domain), 10 * 60 * 1000);
        return result;
    } catch {
        return false;
    }
}

/**
 * 
 * @param {string} email
 * @returns {Promise<{success: boolean, email: string, status: string, description: string}>}
 */
export async function EntityLocalCheck(email) {
    try {
        if (!email) throw { status: "EMPTY", description: "Email cannot be empty." };

        if (!basicSyntaxCheck(email)) throw {
            status: "SYNTAX",
            description: "Email failed basic syntax checks (length, consecutive dots, etc)."
        };

        const domain = email.split("@")[1].toLowerCase();
        const disposableDomains = await loadDisposableDomains();

        if (disposableDomains.has(domain)) throw {
            status: "DISPOSABLE",
            description: `Domain "${domain}" is a known disposable/temporary email provider.`
        };

        const hasMX = await checkDomainMX(domain);
        if (!hasMX) throw {
            status: "DOMAIN",
            description: `Domain "${domain}" does not have MX records.`
        };

        if (!rfc5322EmailRegex.test(email)) throw {
            status: "FORMAT",
            description: "Email does not comply with RFC 5322 format."
        };

        return { success: true, email, status: "LOCAL_OK", description: "Passed local validation." };

    } catch (err) {
        return {
            success: false,
            email,
            status: err.status || "ERROR",
            description: err.description || "Unexpected error during email validation."
        };
    }
}
