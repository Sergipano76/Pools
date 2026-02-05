/**
 * Buy the Dip - Pools Script
 */

let currentData = null;
let currentFilter = 'all';
let countdownInterval = null;

// Formatters
const fmt = {
    pct: (v) => {
        const n = parseFloat(v) || 0;
        return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
    },
    usd: (v) => {
        const n = parseFloat(v) || 0;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
        if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
        return `$${n.toFixed(0)}`;
    },
    time: () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
};

// Countdown
function updateCountdown() {
    const secs = DexService.getTimeUntilRefresh();
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    document.getElementById('countdown').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    if (secs <= 0) loadData();
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

// Render table
function renderTable(pools) {
    const tbody = document.getElementById('tokensTableBody');
    let filtered = pools;

    if (currentFilter !== 'all') {
        filtered = pools.filter(p => p.chain === currentFilter);
    }

    if (!filtered || filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="dim">Nenhum pool encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const pc24Class = p.priceChange24h >= 0 ? 'grn' : 'red';
        const highlightClass = p.vlRatio > 1 ? 'grn' : 'dim';
        const feeDisplay = p.fee ? ` ${p.fee}%` : '';

        return `<tr>
            <td class="${highlightClass}"><a href="${p.url}" target="_blank">${p.symbol}${feeDisplay}</a></td>
            <td class="${highlightClass}">${p.chain}/${p.dexId}</td>
            <td class="${pc24Class}">${fmt.pct(p.priceChange24h)}</td>
            <td class="${highlightClass}">${p.vlRatio.toFixed(2)}</td>
            <td class="${highlightClass}">${fmt.usd(p.volume24h)}</td>
            <td class="${highlightClass}">${fmt.usd(p.liquidityUsd)}</td>
        </tr>`;
    }).join('');
}

// Filter
function filterByChain(chain) {
    currentFilter = chain;
    document.querySelectorAll('button[data-chain]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.chain === chain);
    });
    if (currentData) {
        renderTable(RelativeStrength.analyzeTokens(currentData));
    }
}

// Load data
async function loadData(force = false) {
    try {
        currentData = await DexService.fetchAllData(force);
        const analyzed = RelativeStrength.analyzeTokens(currentData);

        document.getElementById('lastUpdate').textContent = fmt.time();
        renderTable(analyzed);

        console.log(`[${fmt.time()}] Loaded ${analyzed.length} pools`);
    } catch (e) {
        console.error('Error:', e);
        document.getElementById('tokensTableBody').innerHTML =
            '<tr><td colspan="6" class="red">Erro ao carregar dados</td></tr>';
    }
    startCountdown();
}

function refreshData() {
    loadData(true);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(() => loadData(true), 5 * 60 * 1000);
});
