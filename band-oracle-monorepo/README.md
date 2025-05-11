# Football-Oracle-Monorepo

This repository contains all the components needed to build, deploy, and run a fully decentralized football matchday-results oracle on XRPL-EVM using Band Protocol.

## 📁 Repo Structure

```
.
├── .gitignore
├── README.md
├── contracts               # Solidity contracts & migrations
│   ├── FootballDataProvider.sol
│   ├── Oracle.sol
│   └── migrations/deploy.js
├── data-source             # Python script fetching football data
│   ├── football_ds.py
│   └── requirements.txt
├── generate_report.sh      # Generates tree+file-snippet report
├── init_repo.sh            # Scaffold directory tree
├── oracle-script           # Rust/OWASM smart aggregation script
│   ├── Cargo.toml
│   └── src/lib.rs
├── scripts                 # Shell helpers for build & deploy
│   ├── compile-oracle-script.sh
│   ├── deploy-band-resources.sh
│   └── deploy-contracts.sh
└── worker                  # TypeScript off-chain relayer
    ├── package.json
    ├── tsconfig.json
    ├── scripts/
    │   ├── build-data-source.sh
    │   └── start-worker.sh
    └── src/
        ├── bandInteractor.ts
        ├── web3Interactor.ts
        ├── config.ts
        └── index.ts
```

## 🚀 Getting Started

1. **Clone & scaffold**
   ```bash
   git clone <repo_url>
   cd football-oracle-monorepo
   ./init_repo.sh
   ```

2. **Data Source**
   ```bash
   cd data-source
   pip install -r requirements.txt
   ```
   - Implements `football_ds.py` which outputs JSON of match IDs & results.

3. **Compile Oracle Script**
   ```bash
   ./scripts/compile-oracle-script.sh
   ```
   - Builds your Rust → Wasm aggregation logic.

4. **Deploy Band Resources**
   ```bash
   ./scripts/deploy-band-resources.sh
   ```
   - Registers Data Source & Oracle Script on BandChain via `bandchain.js`.

5. **Deploy Smart Contracts**
   ```bash
   ./scripts/deploy-contracts.sh
   ```
   - Deploys `Oracle.sol` and `FootballDataProvider.sol` to XRPL-EVM.

6. **Start Worker**
   ```bash
   cd worker
   npm install
   ./scripts/start-worker.sh
   ```
   - Runs the off-chain relayer that:  
     • Schedules matchdays  
     • Submits BandChain requests  
     • Retrieves & verifies proofs  
     • Publishes on-chain results

## ⚙️ Configuration

- Copy `.env.template` → `.env` at both repo root and `/worker`.
- Set:  
  - `FOOTBALL_API_KEY`  
  - `COMPETITION_ID`    
  - `BAND_GRPC_URL`     
  - `BAND_MNEMONIC`     
  - `WEB3_RPC_URL`      
  - `ORACLE_CONTRACT_ADDRESS`  
  - `FOOTBALL_PROVIDER_ADDRESS`

## 📜 Scripts

- **`generate_report.sh`** — prints repo tree + file snippets
- **`init_repo.sh`**       — scaffolds project layout
- **`compile-oracle-script.sh`** — builds the Wasm oracle script
- **`deploy-band-resources.sh`** — registers on BandChain
- **`deploy-contracts.sh`**      — deploys on XRPL-EVM
- **`worker/scripts/build-data-source.sh`** — packages Python DS
- **`worker/scripts/start-worker.sh`**      — launches relayer

---

Happy decentralizing! 🎉

