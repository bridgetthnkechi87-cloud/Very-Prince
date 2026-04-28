---
id: getting-started
title: Getting Started as an Organization
sidebar_label: Getting Started as an Org
---

# Getting Started as an Organization

This guide walks you through registering your organization on the very-princess payout registry and allocating payouts to your maintainers.

## Prerequisites

- A funded Stellar account on **Testnet** (or Mainnet for production).
- The [Freighter browser extension](https://freighter.app/) installed and configured.
- Your organization's maintainer list (Stellar public keys).

## Step 1 — Connect Your Wallet

1. Navigate to the dashboard at `https://tradeflow.app`.
2. Click **Connect Wallet** in the top-right corner.
3. Approve the connection request in the Freighter popup.

## Step 2 — Register Your Organization

Call the `register_org` contract function with your organization ID:

```bash title="cURL"
curl -X POST https://api.tradeflow.app/orgs \
  -H "Content-Type: application/json" \
  -d '{"org_id": "my-org", "admin": "G..."}'
```

```js title="Node.js"
const response = await fetch("https://api.tradeflow.app/orgs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ org_id: "my-org", admin: "G..." }),
});
const org = await response.json();
```

```python title="Python"
import requests

response = requests.post(
    "https://api.tradeflow.app/orgs",
    json={"org_id": "my-org", "admin": "G..."},
)
org = response.json()
```

## Step 3 — Fund Your Organization

Send XLM to your organization's escrow address to build the public budget:

1. In the dashboard, open your organization's detail page.
2. Click **Fund Org** and enter the XLM amount.
3. Approve the transaction in Freighter.

## Step 4 — Allocate Payouts to Maintainers

Use the `allocate_payout` endpoint to assign balances to individual maintainers:

```bash title="cURL"
curl -X POST https://api.tradeflow.app/orgs/my-org/payouts \
  -H "Content-Type: application/json" \
  -d '{"maintainer": "G...", "amount_stroops": 5000000000}'
```

```js title="Node.js"
await fetch("https://api.tradeflow.app/orgs/my-org/payouts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ maintainer: "G...", amount_stroops: 5_000_000_000 }),
});
```

```python title="Python"
requests.post(
    "https://api.tradeflow.app/orgs/my-org/payouts",
    json={"maintainer": "G...", "amount_stroops": 5_000_000_000},
)
```

## Next Steps

- Set up [Webhooks](./webhooks) to receive real-time payout events.
- Review [API Limits](./api-limits) to understand rate limits.
