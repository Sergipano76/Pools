/**
 * Relative Strength Calculator - Pools Version
 * Analyzes the price change of pairs (e.g., WETH/WBTC)
 */

/**
 * Classify opportunity based on Pool Price Change
 * A negative price change in a pair like WETH/WBTC means WETH is dipping vs WBTC.
 */
function classifyPoolOpportunity(priceChange24h) {
    const rs = priceChange24h;
    if (rs <= -15) {
        return {
            level: 'strong',
            label: '🔥 FORTE REBOUND',
            color: '#00ff88',
            priority: 1
        };
    } else if (rs <= -10) {
        return {
            level: 'moderate',
            label: '⚡ Oportunidade',
            color: '#ffcc00',
            priority: 2
        };
    } else if (rs <= -5) {
        return {
            level: 'watch',
            label: '📊 Monitorar',
            color: '#888888',
            priority: 3
        };
    } else {
        return {
            level: 'none',
            label: '❌ Estável',
            color: '#ff4444',
            priority: 4
        };
    }
}

/**
 * Analyze all pools
 */
function analyzePools(pools) {
    if (!pools || !Array.isArray(pools)) return [];

    // Group by symbol to find duplicates
    const grouped = {};
    pools.forEach(pool => {
        // Calculate V/K (Volatility / Liquidity) for internal prioritization
        const volatility = Math.abs(pool.priceChange24h);
        const liquidity = pool.liquidityUsd || 1;
        pool.vkRatio = volatility / liquidity; // Internal ranking ratio

        // Calculate V/L (Volume / Liquidity) for user display and filtering
        const volume24h = pool.volume24h || 0;
        pool.vlRatio = volume24h / liquidity;

        const key = `${pool.chain}:${pool.symbol}`;
        if (!grouped[key] || pool.vlRatio > grouped[key].vlRatio) {
            grouped[key] = pool;
        }
    });

    const analyzed = Object.values(grouped).map(pool => ({
        ...pool,
        classification: classifyPoolOpportunity(pool.priceChange24h)
    }));

    // Sort by price change (most negative first)
    analyzed.sort((a, b) => a.priceChange24h - b.priceChange24h);

    return analyzed;
}

// Export
window.RelativeStrength = {
    classifyPoolOpportunity,
    analyzeTokens: analyzePools // Keep same name for script.js compatibility
};
