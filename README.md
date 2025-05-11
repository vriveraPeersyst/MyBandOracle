# 📘 Football Oracle Monorepo for XRPL EVM (via Band Protocol)

A fully decentralized football results oracle using [BandChain](https://bandchain.org) as oracle infrastructure and [XRPL EVM Testnet](https://evm-sidechain.xrpl.org/) as the target execution layer.

This repo includes:

* Python data source + TypeScript proxy server for Football-Data API
* Oracle scripts written in OWASM (Rust)
* Smart contract for pushing verified data on XRPL EVM
* Scripts for BandChain deployment
* Off-chain relayer logic

---

## 📁 Repo Layout

```bash
band-oracle-monorepo/
├── .env.example             # Env variables needed for setup
├── contracts/               # XRPL-EVM contracts
│   ├── FootballDataProvider.sol
│   └── migrations/deploy.js
├── data-source/            # Python + TS proxy for Football-Data.org
│   ├── football_ds.py
│   ├── proxy-server.ts
│   └── .env.example
├── oracle-script/          # OWASM logic in Rust
│   └── src/lib.rs
├── scripts/                # Deploy helpers
│   ├── deploy-band-resources.ts
│   ├── oracle-scripts/fixtures_oracle_script/src/
│   └── oracle-scripts/results_oracle_script/src/
├── generate_report.sh      # Utility to inspect repo content
└── init_repo.sh            # Directory scaffolding script
```

---

## ⚙️ Prerequisites

* Node.js (>=18)
* Python 3.x with `requests`
* Rust toolchain (for building OWASM)
* Docker (optional for isolated worker runtime)

---

## 🚀 Step-by-Step Setup

### 1. Clone & Scaffold

```bash
git clone <your_repo_url>
cd band-oracle-monorepo
./init_repo.sh
```

---

### 2. Configure Environment

#### Copy and fill in both env templates:

```bash
cp .env.template .env
cp data-source/.env.example data-source/.env
```

Edit `.env` and set:

* `FOOTBALL_API_KEY` (from [Football-Data.org](https://www.football-data.org/))
* `COMPETITION_ID=PD` (LaLiga)
* `BAND_GRPC_URL`
* `BAND_MNEMONIC`
* `WEB3_RPC_URL`
* `WEB3_PRIVATE_KEY`

---

### 3. Run Proxy Server (for Football API)

```bash
cd data-source
npm install
npx ts-node proxy-server.ts
```

Proxy runs on `localhost:3000`, masking your API key.

---

### 4. Test Data Source

```bash
python3 data-source/football_ds.py results 35
```

Should print match results like:

```json
[
  { "id": "FCBRMA", "result": "X" },
  { "id": "SEVCAD", "result": "1" }
]
```

---

### 5. Compile Oracle Scripts

```bash
cd scripts/oracle-scripts/results_oracle_script
cargo build --release --target wasm32-unknown-unknown
```

Repeat for fixtures if needed.

---

### 6. Register Band Resources

```bash
cd scripts
npx ts-node deploy-band-resources.ts
```

* Registers Python Data Source
* Deploys OWASM Oracle Script

> Requires BAND tokens on Laozi testnet and valid mnemonic

---

### 7. Deploy XRPL Contracts

Deploy the `FootballDataProvider.sol` via Hardhat or Truffle:

```bash
# Adjust deploy-contracts.sh or use your own deployment framework
npx hardhat run scripts/deploy-contracts.sh --network xrplTestnet
```

Save the deployed addresses to `.env`.

---

### 8. Start Off-Chain Relayer

The relayer will:

* Detect upcoming matchdays
* Request Band oracle data
* Fetch proof + relay it to the XRPL contract

```bash
cd worker
npm install
./scripts/start-worker.sh
```

> Ensure `.env` contains:
>
> * `BAND_ORACLE_SCRIPT_ID`
> * `FOOTBALL_PROVIDER_ADDRESS`

---

## 🛠 Optional Scripts

* `generate_report.sh` → Outputs tree + file preview to `repo_report.txt`
* `init_repo.sh` → Scaffolds directory layout from scratch

---

## 🧪 Sample Fixture

**Input:** `GET /results?matchday=35&competition=PD`

**Output:**

```json
[
  { "id": "FCBRMA", "result": "1" },
  { "id": "SEVCAD", "result": "X" }
]
```

> `id` = 3-letter home + away (e.g. FCB = Barcelona, RMA = Real Madrid)

---

## 🧩 Architecture Overview

```text
Football-Data API
     ↓
[proxy-server.ts] — hides API key
     ↓
[football_ds.py]  — run by BandChain validators
     ↓
Oracle Script     — aggregates results
     ↓
BandBridge        — verifies proof
     ↓
FootballDataProvider.sol (XRPL-EVM)
```

---

## 🧼 Cleanup

To reset everything:

```bash
git clean -fdx
rm -rf .env data-source/.env
```

---

## 📮 Support

For help deploying this on BandChain or XRPL-EVM, reach out via Band Protocol or XRPL Dev Discords.

---

Happy deploying! ⚽
