#!/usr/bin/env python3

import sys
import requests
import json
import os
from copy import deepcopy

PROXY_URL = "http://localhost:3000"

def set_header_from_env(headers: dict, key: str):
    """
    Reads the specified environment variable and adds it to headers if present.

    Args:
        headers: Current header dictionary.
        key: Environment variable key.
    """
    value = os.environ.get(key)
    if value is not None:
        headers[key] = value

def set_request_verification_headers(existing_headers: dict | None = None) -> dict:
    """
    Injects BandChain request metadata into headers for verification.

    Args:
        existing_headers: Optional existing headers to extend.
    Returns:
        A new headers dict including BandChain verification fields.
    """
    headers = deepcopy(existing_headers) if existing_headers else {}

    band_keys = [
        "BAND_CHAIN_ID",
        "BAND_VALIDATOR",
        "BAND_REQUEST_ID",
        "BAND_EXTERNAL_ID",
        "BAND_DATA_SOURCE_ID",
        "BAND_REPORTER",
        "BAND_SIGNATURE",
    ]

    for band_key in band_keys:
        set_header_from_env(headers, band_key)

    return headers

def main():
    if len(sys.argv) != 3:
        raise Exception("Expected 2 arguments: <endpoint> <matchday>")

    endpoint = sys.argv[1]      # "fixtures" or "results"
    matchday = sys.argv[2]
    competition = "PD"          # fixed for LaLiga

    url = f"{PROXY_URL}/{endpoint}?matchday={matchday}&competition={competition}"

    # Build headers: Football-Data auth + forwarded BandChain metadata
    headers = {'X-Auth-Token': os.environ.get('FOOTBALL_API_KEY', '')}
    headers = set_request_verification_headers(headers)

    response = requests.get(url, headers=headers)

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
