/**
 * MealMitra Load & Concurrency Benchmark Test
 * 
 * Tests how many concurrent requests the current MealMitra backend architecture
 * can serve at a time across different concurrency tiers.
 * 
 * Tests:
 * 1. Express Event Loop & Middleware throughput (GET /)
 * 2. Real Database Query throughput with JWT Auth (GET /api/donations)
 * 
 * Usage: node loadTest.js
 */

require("dotenv").config();
const http = require("http");
const jwt = require("jsonwebtoken");

const BASE_URL = "http://localhost:5000";
const CONCURRENCY_LEVELS = [10, 25, 50, 100, 200];
const REQUESTS_PER_TIER = 200;

// Reusable HTTP Keep-Alive Agent with high socket limits
const agent = new http.Agent({
    keepAlive: true,
    maxSockets: 1000,
    maxFreeSockets: 200,
});

// Generate a valid JWT for an existing verified NGO user to test DB endpoints
const testToken = jwt.sign(
    { id: "6a817c787e7ee6b7445ac37d", role: "NGO" },
    process.env.JWT_SECRET || "your_jwt_secret_key",
    { expiresIn: "1d" }
);

function sendRequest(path, options = {}) {
    return new Promise((resolve) => {
        const start = performance.now();
        const req = http.request(
            `${BASE_URL}${path}`,
            {
                agent,
                method: options.method || "GET",
                headers: options.headers || {},
                timeout: 8000,
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    const duration = performance.now() - start;
                    resolve({
                        success: res.statusCode >= 200 && res.statusCode < 400,
                        statusCode: res.statusCode,
                        duration,
                    });
                });
            }
        );

        req.on("error", (err) => {
            const duration = performance.now() - start;
            resolve({
                success: false,
                statusCode: 0,
                error: err.code || err.message,
                duration,
            });
        });

        req.on("timeout", () => {
            req.destroy();
            const duration = performance.now() - start;
            resolve({
                success: false,
                statusCode: 408,
                error: "ETIMEDOUT",
                duration,
            });
        });

        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

// Concurrency pool executor
async function runConcurrencyTier(path, headers, concurrency, totalRequests) {
    const results = [];
    let nextIndex = 0;

    const startTotal = performance.now();

    async function worker() {
        while (nextIndex < totalRequests) {
            nextIndex++;
            const res = await sendRequest(path, { headers });
            results.push(res);
        }
    }

    const workers = [];
    for (let i = 0; i < Math.min(concurrency, totalRequests); i++) {
        workers.push(worker());
    }

    await Promise.all(workers);
    const totalTimeMs = performance.now() - startTotal;

    const durations = results.map((r) => r.duration).sort((a, b) => a - b);
    const successes = results.filter((r) => r.success).length;
    const failures = results.length - successes;
    const rps = (results.length / (totalTimeMs / 1000)).toFixed(1);

    const min = durations[0]?.toFixed(1) || 0;
    const max = durations[durations.length - 1]?.toFixed(1) || 0;
    const avg = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1);
    const p50 = durations[Math.floor(durations.length * 0.5)]?.toFixed(1) || 0;
    const p95 = durations[Math.floor(durations.length * 0.95)]?.toFixed(1) || 0;

    return {
        concurrency,
        totalRequests,
        successes,
        failures,
        rps,
        totalTimeMs: totalTimeMs.toFixed(0),
        min,
        avg,
        p50,
        p95,
        max,
    };
}

async function runBenchmark() {
    console.log("=========================================================================================");
    console.log("⚡ MealMitra Architecture Concurrency & Capacity Benchmark");
    console.log(`🎯 Target Server: ${BASE_URL}`);
    console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
    console.log("=========================================================================================\n");

    // Warm-up check
    try {
        const ping = await sendRequest("/");
        if (!ping.success) {
            console.error(`❌ Server returned HTTP ${ping.statusCode} on /`);
            process.exit(1);
        }
        console.log("✅ Server is online and responsive.");
    } catch (e) {
        console.error("❌ Failed to reach server. Make sure it is running on port 5000.");
        process.exit(1);
    }

    // SUITE 1: Pure Express / Node Event Loop
    console.log("\n🧪 TEST SUITE 1: Express Event Loop & Core Routing Throughput (GET /)");
    console.log("-----------------------------------------------------------------------------------------");
    console.log("| Concurrency | Total Reqs | Success Rate |   Throughput (RPS)  | Avg Latency |   p95   |  Max Latency |");
    console.log("-----------------------------------------------------------------------------------------");

    for (const c of CONCURRENCY_LEVELS) {
        const tier = await runConcurrencyTier("/", {}, c, REQUESTS_PER_TIER);
        const successPercent = ((tier.successes / tier.totalRequests) * 100).toFixed(1) + "%";
        console.log(
            `| ${c.toString().padEnd(11)} | ${tier.totalRequests.toString().padEnd(10)} | ${successPercent.padEnd(12)} | ${(tier.rps + " req/s").padEnd(19)} | ${(tier.avg + " ms").padEnd(11)} | ${(tier.p95 + " ms").padEnd(7)} | ${(tier.max + " ms").padEnd(12)} |`
        );
    }
    console.log("-----------------------------------------------------------------------------------------");

    // SUITE 2: Full Database Query + JWT Middleware
    console.log("\n🧪 TEST SUITE 2: Real Database Queries + JWT Auth (GET /api/donations)");
    console.log("-----------------------------------------------------------------------------------------");
    console.log("| Concurrency | Total Reqs | Success Rate |   Throughput (RPS)  | Avg Latency |   p95   |  Max Latency |");
    console.log("-----------------------------------------------------------------------------------------");

    const authHeaders = { Authorization: `Bearer ${testToken}` };

    for (const c of CONCURRENCY_LEVELS) {
        const tier = await runConcurrencyTier("/api/donations", authHeaders, c, 100);
        const successPercent = ((tier.successes / tier.totalRequests) * 100).toFixed(1) + "%";
        console.log(
            `| ${c.toString().padEnd(11)} | ${tier.totalRequests.toString().padEnd(10)} | ${successPercent.padEnd(12)} | ${(tier.rps + " req/s").padEnd(19)} | ${(tier.avg + " ms").padEnd(11)} | ${(tier.p95 + " ms").padEnd(7)} | ${(tier.max + " ms").padEnd(12)} |`
        );
    }
    console.log("-----------------------------------------------------------------------------------------\n");

    console.log("🎯 Capacity Verdict & Key Takeaways are ready to report.");
    process.exit(0);
}

runBenchmark();
