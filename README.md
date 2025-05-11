
# 📘 MyBandOracle Monorepo

A fully end-to-end decentralized football results oracle, using [BandChain](https://bandchain.org) as oracle infrastructure and an EVM-compatible target chain (e.g. XRPL-EVM) for on-chain publishing.

---

## 📁 Repo Structure

```

MyBandOracle
├── .gitignore
├── README.md
├── band-oracle-monorepo
│   ├── .env.example
│   ├── .env.template
│   ├── README.md
│   ├── contracts
│   │   ├── FootballDataProvider.sol
│   │   └── migrations
│   │       └── deploy.js
│   ├── data-source
│   │   ├── .env.example
│   │   ├── football\_ds.py
│   │   ├── package.json
│   │   ├── proxy-server.ts
│   │   ├── requirements.txt
│   │   └── tsconfig.json
│   ├── generate\_report.sh
│   ├── init\_repo.sh
│   ├── oracle-script
│   │   ├── Cargo.toml
│   │   └── src
│   │       └── lib.rs
│   └── scripts
│       ├── deploy-band-resources.ts
│       ├── oracle-scripts
│       │   ├── fixtures\_oracle\_script
│       │   │   └── src
│       │   │       ├── deploy-fixtures-oracle.script.ts
│       │   │       └── lib.rs
│       │   └── results\_oracle\_script
│       │       └── src
│       │           ├── deploy-results-oracle-script.ts
│       │           └── lib.rs
│       └── package.json
├── generate\_report.sh
└── repo\_report.txt

13 directories, 25 files

````

> **Note:** binary files (`.DS_Store`, compiled artifacts, locks) are omitted for clarity.

---

## 📝 What’s Inside

- **`band-oracle-monorepo/`**: the core project  
  - **`contracts/`**: Solidity on-chain contract & migrations  
  - **`data-source/`**: Python & TS proxy for fetching Football-Data API  
  - **`oracle-script/`**: Rust → OWASM aggregation logic  
  - **`scripts/`**: TypeScript helpers to register Band data sources & scripts  
  - **`generate_report.sh`**, **`init_repo.sh`**: repo introspection & scaffolding utilities  

- **Root-level tools**:  
  - **`generate_report.sh`**: prints the full tree + key file snippets into `repo_report.txt`  
  - **`repo_report.txt`**: example report output  

---

## ⚙️ Prerequisites

- **Node.js** ≥ v18  
- **Python 3.8+**  
- **Rust toolchain** (with `wasm32-unknown-unknown` target)  
- **BandChain CLI & tokens** on testnet  
- **EVM-compatible RPC endpoint** (e.g. XRPL-EVM testnet)  
- **`tree`** and standard UNIX tools

---

## 🚀 Detailed Setup Guide

### 1. Clone & Scaffold

```bash
git clone <YOUR_REPO_URL> MyBandOracle
cd MyBandOracle/band-oracle-monorepo
./init_repo.sh
````

This creates all directories & placeholder files.

---

### 2. Environment Configuration

#### 2.1 Root `.env`

```bash
cp .env.template .env
```

Edit root `.env` and set:

* `FOOTBALL_API_KEY=` *(your Football-Data.org key)*
* `COMPETITION_ID=PD`
* `BAND_GRPC_URL=` *(e.g. `https://laozi-testnet6.bandchain.org/grpc-web`)*
* `BAND_MNEMONIC=` *(12-word mnemonic with testnet BAND tokens)*
* `WEB3_RPC_URL=` *(EVM RPC URL, e.g. XRPL-EVM)*
* `WEB3_PRIVATE_KEY=` *(deployer’s private key)*
* `ORACLE_CONTRACT_ADDRESS=` *(later, fill after deploy)*

#### 2.2 Data-Source `.env`

```bash
cd data-source
cp .env.example .env
```

* `FOOTBALL_API_KEY=` *(same key)*
* `PORT=3000`

---

### 3. Launch Local Proxy Server

```bash
cd data-source
npm install
npx ts-node proxy-server.ts
```

* Exposes:

  * `GET /fixtures?matchday={n}&competition={id}`
  * `GET /results?matchday={n}&competition={id}`

---

### 4. Validate Data-Source Script

```bash
python3 football_ds.py fixtures 1   # should print JSON of match IDs + kickoff timestamps
python3 football_ds.py results 1    # JSON of finished match results (1/X/2)
```

---

### 5. Compile OWASM Oracle Script

```bash
cd ../oracle-script
cargo build --release --target wasm32-unknown-unknown
```

* Outputs `.wasm` in `target/…/release/`

---

### 6. Register Band Data Source & Oracle Script

```bash
cd ../scripts
npm install
npx ts-node deploy-band-resources.ts
```

This will:

1. **Upload** the `football_ds.py` executable as a Band data source.
2. **Register** the OWASM script (fixtures/results) on BandChain.

> Ensure your account has enough testnet BAND tokens.

---

### 7. Deploy Smart Contract to EVM

```bash
# Example using Hardhat
npx hardhat run ../scripts/deploy-contracts.sh --network xrplTestnet
```

* Deploys `FootballDataProvider.sol`
* Emits deployed addresses—add to root `.env`:

  * `FOOTBALL_PROVIDER_ADDRESS=`
  * `ORACLE_CONTRACT_ADDRESS=`

---

### 8. Start Off-Chain Relayer (“Worker”)

```bash
cd ../worker
npm install
./scripts/start-worker.sh
```

Relayer workflow:

1. Reads upcoming matchdays.
2. Calls BandChain via the registered oracle script.
3. Retrieves aggregated results + proof.
4. Calls `relayProof()` on `FootballDataProvider.sol`.

---

## 🔧 Scripts Reference

| Script                             | Purpose                                           |
| ---------------------------------- | ------------------------------------------------- |
| `init_repo.sh`                     | Scaffold project directories & files              |
| `generate_report.sh`               | Dump tree + file snippets → `repo_report.txt`     |
| `scripts/deploy-band-resources.ts` | Register data source & oracle script on BandChain |
| `scripts/oracle-scripts/*`         | Rust & TS code for fixtures/results OWASM         |
| `scripts/deploy-contracts.sh`      | Deploy Solidity contracts to EVM                  |
| `worker/scripts/start-worker.sh`   | Launch off-chain relayer                          |

---

## 🏗️ Architecture Overview

```text
Football-Data API
      ↓ (private key hidden by proxy-server.ts)
[proxy-server.ts] → local REST endpoint
      ↓
[football_ds.py]  — run by BandChain validators
      ↓ JSON
[OWASM oracle-script] — aggregate fixtures/results
      ↓
BandChain → proof + result
      ↓
FootballDataProvider.sol on EVM
```

---

## 🧹 Cleanup & Reset

```bash
# Remove all generated files & envs
git clean -fdx
rm -f .env data-source/.env worker/.env
```

---

## 📮 Support & Contributions

Feel free to open issues or PRs—your feedback helps make this oracle battle-tested and production-ready!

---

Happy decentralizing! ⚽🎉
