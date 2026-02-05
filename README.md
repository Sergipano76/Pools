# Buy the Dip - Pools Collateral Analyzer

Aplicativo para identificar oportunidades de **rebound** em pools e ativos collateral, comparando a performance 24h de tokens contra o WBTC nas redes **Polygon** e **Base**.

## 🚀 Como Usar

### Iniciar o servidor:
```bash
cd /home/user/Público/Buy-the-Dip-Pools-collateral
python3 -m http.server 8080
```

### Abrir no navegador:
```
http://localhost:8080
```

## 📊 Estratégia "Buy the Dip"

O app compara a performance 24h de cada token contra o WBTC:

| Força Relativa (RS) | Classificação |
|---------------------|---------------|
| ≤ -15% | 🔥 **FORTE OPORTUNIDADE** |
| -15% a -10% | ⚡ Oportunidade Moderada |
| -10% a -5% | 📊 Monitorar |
| > -5% | ❌ Sem oportunidade |

**Fórmula:** `RS = Performance_Token - Performance_WBTC`

## ⚙️ Configurações

- **Redes:** Polygon, Base
- **Atualização:** A cada 5 minutos
- **Benchmark:** WBTC / cbBTC

## 📁 Estrutura

```
Buy-the-Dip-Pools-collateral/
├── index.html          # Dashboard principal
├── style.css           # Estilos
├── script.js           # Lógica do app
├── services/
│   └── dex_service.js  # Integração DexScreener API
├── core/
│   └── relative_strength.js  # Cálculo de RS
└── README.md
```
