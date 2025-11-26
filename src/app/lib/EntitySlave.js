"use client";

import { useState, useRef, useEffect } from "react";

export default function EntitySlave() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio("/success.mp3");
    }, []);

    const slowDomains = [
        "comcast.net", "juno.com", "netzero.com", "netzero.net", "hotmail.com", "live.com",
        "msn.com", "outlook.com", "yahoo.com", "ymail.com", "rocketmail.com", "aol.com",
        "att.net", "bellsouth.net", "earthlink.net", "sbcglobal.net", "verizon.net",
        "windstream.net", "shaw.ca", "bigpond.com", "optusnet.com.au", "optonline.net",
        "btinternet.com", "virginmedia.com"
    ];

    const normalizeStatus = (s) => {
        if (!s) return "unknown";
        const status = s.toUpperCase();
        if (status === "DELIVERABLE") return "valid";
        if (status === "INVALID") return "invalid";
        if (status === "FORMAT") return "invalid email";
        if (status === "SYNTAX") return "email syntax error";
        if (status === "DOMAIN") return "mx record not found";
        if (status === "DISPOSABLE") return "disposable email";
        if (status === "UNREACHABLE") return "unknown";
        return "unknown";
    };

    // const shouldRetryInvalid = (email) => {
    //     const domain = email.split("@")[1]?.toLowerCase();
    //     return slowDomains.includes(domain);
    // };

    const fetchWithRetry = async (email, attempts = 3, retry = true) => {
        let lastMapped = null;

        for (let i = 0; i < attempts; i++) {
            try {
                const res = await fetch("/api/entity-bounce", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const data = await res.json();

                if (data.status === "SYNTAX") {
                    setResults((prev) =>
                        prev.map((r) =>
                            r.email === email
                                ? {
                                    email,
                                    status: "email syntax error",
                                    loading: false,
                                    error: true,
                                }
                                : r
                        )
                    );
                    return "email syntax error";
                }

                if (data.status === "DOMAIN") {
                    setResults((prev) =>
                        prev.map((r) =>
                            r.email === email
                                ? {
                                    email,
                                    status: "mx record not found",
                                    loading: false,
                                    error: true,
                                }
                                : r
                        )
                    );
                    return "mx record not found";
                }

                if (data.status === "DISPOSABLE") {
                    setResults((prev) =>
                        prev.map((r) =>
                            r.email === email
                                ? {
                                    email,
                                    status: "disposable email",
                                    loading: false,
                                    error: true,
                                }
                                : r
                        )
                    );
                    return "disposable email";
                }

                if (data.status === "FORMAT") {
                    setResults((prev) =>
                        prev.map((r) =>
                            r.email === email
                                ? {
                                    email,
                                    status: "invalid email",
                                    loading: false,
                                    error: true,
                                }
                                : r
                        )
                    );
                    return "invalid email";
                }

                const mapped = normalizeStatus(data.status);

                lastMapped = mapped || lastMapped;

                if (!retry) return mapped;

                if (mapped === "valid") return "valid";

                if (mapped === "invalid") return "invalid";

                if (mapped === "unknown" && i < attempts - 1) {
                    const delay = 50 * Math.pow(2, i);
                    await new Promise((r) => setTimeout(r, delay));
                    continue;
                }

                return mapped;

            } catch (err) {
                if (!retry) return "error";

                if (i === attempts - 1) {
                    return lastMapped && lastMapped !== "unknown" ? lastMapped : "error";
                }
                const delay = 50 * Math.pow(2, i);
                await new Promise((r) => setTimeout(r, delay));
            }
        }

        return lastMapped || "unknown";
    };

    const startProcessing = async (emails, workerCount, retry = true) => {
        setResults([]);
        setLoading(true);
        setError(null);

        const queue = [...emails];
        let activeWorkers = 0;

        const worker = async () => {
            activeWorkers++;

            while (queue.length > 0) {
                const email = queue.shift();
                if (!email) continue;

                setResults((prev) => [
                    ...prev,
                    { email, status: "processing...", loading: true, error: false },
                ]);

                const status = await fetchWithRetry(email, 3, retry);

                setResults((prev) =>
                    prev.map((r) =>
                        r.email === email
                            ? {
                                email,
                                status,
                                loading: false,
                                error: status === "error",
                            }
                            : r
                    )
                );
            }

            activeWorkers--;
        };

        for (let i = 0; i < workerCount; i++) worker();

        const watcher = setInterval(() => {
            if (activeWorkers === 0) {
                clearInterval(watcher);
                setLoading(false);
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => { });
                }
            }
        }, 300);
    };

    return { results, loading, error, startProcessing };
}
