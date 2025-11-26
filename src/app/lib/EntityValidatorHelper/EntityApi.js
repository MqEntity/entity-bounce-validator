import fetch from "node-fetch";
import { load } from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";

const USE_PROXY = true;
const PROXY_URL = process.env.ENTITY_PROXY;
const ENTITY_ENDPOINT = process.env.ENTITY_ENDPOINT;
const ENTITY_VERIFY_ENDPOINT = process.env.ENTITY_VERIFY_ENDPOINT;

function getFreshAgent() {
    return USE_PROXY ? new HttpsProxyAgent(PROXY_URL) : undefined;
}

export async function EntityApi(email) {
    const baseHeaders = {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    };

    const initialRes = await fetch(ENTITY_ENDPOINT + "/", {
        method: "GET",
        headers: baseHeaders,
        redirect: "manual",
        agent: getFreshAgent(),
    });

    const cookieList = initialRes.headers.raw()["set-cookie"] || [];
    const cookieHeader = cookieList.map((c) => c.split(";")[0]).join("; ");

    const initialHTML = await initialRes.text();
    const $ = load(initialHTML);

    const token = $('input[name="_token"]').attr("value");
    if (!token) throw new Error("Missing _token");

    let xsrfToken = null;
    for (const c of cookieList) {
        if (c.startsWith("XSRF-TOKEN=")) {
            xsrfToken = decodeURIComponent(c.split("=")[1].split(";")[0]);
        }
    }

    const verifyHeaders = {
        accept: "*/*",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        origin: ENTITY_ENDPOINT,
        referer: ENTITY_ENDPOINT + "/",
        cookie: cookieHeader,
        ...(xsrfToken && { "x-xsrf-token": xsrfToken }),
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    };

    const body = `_token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const verifyRes = await fetch(ENTITY_VERIFY_ENDPOINT, {
        method: "POST",
        headers: verifyHeaders,
        body,
        agent: getFreshAgent(),
    });

    const html = await verifyRes.text();
    const $$ = load(html);

    const blockNode = $$(".col-sm-11").first();
    let raw = blockNode.text().trim();

    if (!raw || raw.length < 3) {
        return {
            success: true,
            email,
            status: "UNKNOWN",
            description: "Unable to parse email verification response.",
        };
    }

    raw = raw.replace(/\s+/g, " ").trim();
    const status = raw.split(" ")[0] || "UNKNOWN";
    const description = raw.substring(status.length).trim();

    return {
        success: true,
        email,
        status,
        description,
    };
}
