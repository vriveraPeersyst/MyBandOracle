#!/usr/bin/env python3

import sys
import requests
import json

PROXY_URL = "http://localhost:3000"

def main():
    if len(sys.argv) != 3:
        raise Exception("Expected 2 arguments: <endpoint> <matchday>")

    endpoint = sys.argv[1]      # "fixtures" or "results"
    matchday = sys.argv[2]
    competition = "PD"          # fixed for LaLiga

    url = f"{PROXY_URL}/{endpoint}?matchday={matchday}&competition={competition}"
    response = requests.get(url)

    if response.status_code != 200:
        raise Exception(f"HTTP {response.status_code}: {response.text}")

    data = response.json()
    print(json.dumps(data))     # BandChain expects stdout output

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
