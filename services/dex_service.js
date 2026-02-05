/**
 * DexScreener API Service - Pools Version
 */

const DEX_API_BASE = 'https://api.dexscreener.com';

// Direct Pair Addresses (High liquidity pools for AAVE Collateral)
const TRACKED_POOLS = {
    polygon: [
        { address: '0x86f1d8390222A3691C28938eC7404A1661E618e0', symbol: 'WETH/WPOL', fee: 0.05 },
        { address: '0x2aCeda63B5e958c45bd27d916ba701BC1DC08F7a', symbol: 'AAVE/WETH', fee: 0.3 },
        { address: '0x3e31AB7f37c048FC6574189135D108df80F0ea26', symbol: 'LINK/WETH', fee: 0.3 },
        { address: '0x642F28a89fa9d0Fa30e664F71804Bfdd7341D21f', symbol: 'WBTC/WPOL', fee: 0.05 },
        { address: '0x141688f5EAB27CBa15b5588f011bdEfc25F9Eae6', symbol: 'AAVE/WBTC', fee: 0.3 },
        { address: '0xdc9232e2df177d7a12fdff6ecbab114e2231198d', symbol: 'WETH/WBTC', fee: 0.05 },
        { address: '0xfaE91e08188332ED6Ea09b314BBE3FC6cD1432C1', symbol: 'AAVE/LINK', fee: 0.3 },
        { address: '0xa9077cDB3D13F45B8B9d87C43E11bCe0e73D8631', symbol: 'AAVE/WPOL', fee: 0.3 },
        { address: '0x0A28C2F5E0E8463E047C203F00F649812aE67E4f', symbol: 'LINK/WPOL', fee: 0.3 },
        { address: '0x0c61D1E9bBEC03cA9d1cA2Db0C94fa08AC91Ad5a', symbol: 'LINK/WBTC', fee: 0.3 }
    ],
    base: [
        { address: '0x70aCDF2Ad0bf2402C957154f944c19Ef4e1cbAE1', symbol: 'cbBTC/WETH', fee: 0.0366 },
        { address: '0x4a79B0168296c0eF7b8F314973B82aD406a29f1B', symbol: 'AAVE/WETH', fee: 0.3 },
        { address: '0x72bE417AFB0aBEa66913141C605D313BB389b59C', symbol: 'LINK/WETH', fee: 0.25 }
    ]
};

const cache = {
    data: [],
    timestamp: null,
    ttl: 30000 // 30 seconds
};

async function getPairData(chain, addr) {
    try {
        const res = await fetch(`${DEX_API_BASE}/latest/dex/pairs/${chain}/${addr}`);
        const data = await res.json();
        const pair = data.pair || (data.pairs && data.pairs[0]);

        if (!pair) {
            console.warn(`No data found for ${chain} address: ${addr}`);
            return null;
        }

        // Find the friendly symbol from our config
        const config = TRACKED_POOLS[chain].find(p => p.address.toLowerCase() === addr.toLowerCase());

        return {
            symbol: config ? config.symbol : pair.baseToken.symbol + '/' + pair.quoteToken.symbol,
            fee: config ? config.fee : null,
            chain: chain,
            dexId: pair.dexId,
            price: parseFloat(pair.priceUsd),
            priceChange1h: pair.priceChange?.h1 || 0,
            priceChange24h: pair.priceChange?.h24 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidityUsd: pair.liquidity?.usd || 0,
            url: pair.url
        };
    } catch (err) {
        console.error(`Error fetching ${chain}/${addr}:`, err);
        return null;
    }
}

async function fetchAllData() {
    const now = Date.now();
    if (cache.timestamp && (now - cache.timestamp < cache.ttl)) {
        return cache.data;
    }

    const results = [];
    const promises = [];

    for (const chain in TRACKED_POOLS) {
        for (const pool of TRACKED_POOLS[chain]) {
            promises.push(getPairData(chain, pool.address));
        }
    }

    const data = await Promise.all(promises);
    const validData = data.filter(d => d !== null);

    cache.data = validData;
    cache.timestamp = now;
    return validData;
}

function getTimeUntilRefresh() {
    if (!cache.timestamp) return 0;
    const elapsed = Date.now() - cache.timestamp;
    const remaining = Math.max(0, cache.ttl - elapsed);
    return Math.ceil(remaining / 1000);
}

// Export
window.DexService = {
    fetchAllData,
    getTimeUntilRefresh,
    TRACKED_POOLS
};
