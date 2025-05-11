#!/usr/bin/env bash
# init_repo.sh - Scaffold football-oracle-monorepo directory tree

# Ensure script runs from project root
dir=$(dirname "$0")
cd "$dir"

# Directories to create
dirs=(
  data-source
  oracle-script/src
  contracts/migrations
  worker/src
  worker/scripts
  scripts
)

for d in "${dirs[@]}"; do
  mkdir -p "$d"
done

# Files to touch
files=(
  .gitignore
  README.md
  data-source/football_ds.py
  data-source/requirements.txt
  oracle-script/Cargo.toml
  oracle-script/src/lib.rs
  contracts/FootballDataProvider.sol
  contracts/Oracle.sol
  contracts/migrations/deploy.js
  worker/package.json
  worker/tsconfig.json
  worker/src/index.ts
  worker/src/bandInteractor.ts
  worker/src/web3Interactor.ts
  worker/src/config.ts
  worker/scripts/build-data-source.sh
  worker/scripts/start-worker.sh
  scripts/compile-oracle-script.sh
  scripts/deploy-band-resources.sh
  scripts/deploy-contracts.sh
)

for f in "${files[@]}"; do
  touch "$f"
done

echo "Directory tree scaffolded successfully!"
