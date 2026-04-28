# Project Sunset & Emergency Migration Runbook

This document defines the exact procedures for safely sunsetting the V1 contract or migrating to a V2 contract. The guiding principle is **no maintainer funds are ever locked** — every allocated payout remains claimable even after the project winds down.

---

## Table of Contents

1. [Decision Criteria](#1-decision-criteria)
2. [Phase 1 — Pause the V1 Contract](#2-phase-1--pause-the-v1-contract)
3. [Phase 2 — Snapshot Final Ledger State](#3-phase-2--snapshot-final-ledger-state)
4. [Phase 3 — Frontend Sunset Banner](#4-phase-3--frontend-sunset-banner)
5. [Phase 4 — V2 Migration (if applicable)](#5-phase-4--v2-migration-if-applicable)
6. [Phase 5 — Permanent Permissionless Claim Window](#6-phase-5--permanent-permissionless-claim-window)
7. [Emergency Rollback](#7-emergency-rollback)
8. [Contacts & Escalation](#8-contacts--escalation)

---

## 1. Decision Criteria

A sunset or migration is triggered by **any** of the following:

| Trigger | Owner |
|---|---|
| Critical security vulnerability in V1 contract | Security Lead |
| Governance vote to migrate to V2 | DAO / Maintainers |
| Funding runway exhausted | Project Lead |
| Regulatory requirement | Legal |

Before proceeding, open a GitHub Discussion tagged `sunset` and allow **72 hours** for community comment.

---

## 2. Phase 1 — Pause the V1 Contract

> **Goal:** Stop new deposits and payout allocations while preserving all existing balances.

### 2.1 Prerequisites

- Admin keypair with `pause` authority loaded in Freighter (Testnet or Mainnet).
- Soroban CLI installed and configured:
  ```bash
  soroban config network add mainnet \
    --rpc-url https://soroban-mainnet.stellar.org \
    --network-passphrase "Public Global Stellar Network ; September 2015"
  ```

### 2.2 Invoke the Pause Function

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network mainnet \
  -- \
  pause
```

Expected output: `()` (unit return — no error).

### 2.3 Verify Pause State

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network mainnet \
  -- \
  is_paused
```

Expected output: `true`

### 2.4 Announce on All Channels

Post to Discord, Twitter/X, and the project website within **1 hour** of pausing:

> ⚠️ The very-princess V1 contract has been paused. No new deposits are accepted. All existing payout allocations remain claimable indefinitely. See RUNBOOK_MIGRATION.md for details.

---

## 3. Phase 2 — Snapshot Final Ledger State

> **Goal:** Produce a verifiable, auditable record of every maintainer's unclaimed balance at the time of pause.

### 3.1 Export State via Backend Script

```bash
# From packages/backend
npx ts-node scripts/snapshot-ledger.ts \
  --contract $CONTRACT_ID \
  --network mainnet \
  --output snapshots/v1-final-$(date +%Y%m%d).json
```

The script queries the Soroban RPC for all `MaintainerBalance` ledger entries and writes them to a JSON file.

### 3.2 Expected Snapshot Format

```json
{
  "contract_id": "C...",
  "ledger_sequence": 12345678,
  "timestamp": "2026-01-01T00:00:00Z",
  "balances": [
    {
      "maintainer": "G...",
      "organization": "stellar",
      "allocated_stroops": 5000000000
    }
  ]
}
```

### 3.3 Publish the Snapshot

1. Upload the JSON to IPFS:
   ```bash
   ipfs add snapshots/v1-final-*.json
   ```
2. Pin the CID with a pinning service (Pinata / web3.storage).
3. Commit the CID to the repository in `snapshots/README.md`.
4. Post the IPFS CID in the GitHub Discussion opened in Phase 0.

---

## 4. Phase 3 — Frontend Sunset Banner

> **Goal:** Ensure every user who visits the dashboard is immediately informed and guided to withdraw funds.

### 4.1 Enable the Banner

Set the environment variable in Vercel (or your hosting provider):

```
NEXT_PUBLIC_SUNSET_MODE=true
NEXT_PUBLIC_SUNSET_DATE=2026-06-01
NEXT_PUBLIC_SUNSET_MESSAGE="very-princess V1 is sunsetting. Please claim your payouts before June 1, 2026."
```

The `layout.tsx` reads `NEXT_PUBLIC_SUNSET_MODE` and renders a sticky top banner when `true`.

### 4.2 Banner Behaviour

- **Sticky** at the top of every page (z-index above all other UI).
- **Non-dismissible** — users cannot close it.
- Contains a direct link to the **Claim Payout** page.
- Displays the exact sunset date in the user's local timezone.
- Colour: amber/warning (`bg-amber-500 text-black`).

### 4.3 Disable New Wallet Connections

After the sunset date, set:

```
NEXT_PUBLIC_DISABLE_WALLET_CONNECT=true
```

This prevents new wallet connections while still allowing existing sessions to claim.

---

## 5. Phase 4 — V2 Migration (if applicable)

> Skip this phase if the project is fully sunsetting with no successor contract.

### 5.1 Deploy V2 Contract

```bash
soroban contract deploy \
  --wasm packages/contracts/target/wasm32-unknown-unknown/release/very_princess.wasm \
  --source admin \
  --network mainnet
```

Save the new `CONTRACT_ID_V2`.

### 5.2 Migrate Balances

Run the migration script which reads the V1 snapshot and calls `migrate_balance` on V2 for each entry:

```bash
npx ts-node scripts/migrate-v1-to-v2.ts \
  --snapshot snapshots/v1-final-*.json \
  --v2-contract $CONTRACT_ID_V2 \
  --network mainnet
```

The script batches calls in groups of 100 to stay within Soroban fee limits.

### 5.3 Verify Migration

```bash
npx ts-node scripts/verify-migration.ts \
  --snapshot snapshots/v1-final-*.json \
  --v2-contract $CONTRACT_ID_V2 \
  --network mainnet
```

Expected output: `✅ All 123 balances verified. Total: 500 XLM migrated.`

### 5.4 Update Frontend

Update `NEXT_PUBLIC_CONTRACT_ID` to `CONTRACT_ID_V2` and redeploy.

---

## 6. Phase 5 — Permanent Permissionless Claim Window

> **This phase is non-negotiable.** Maintainers must always be able to claim their allocated payouts, even years after the frontend is taken down.

### 6.1 Contract Guarantee

The V1 contract's `claim` function has **no admin gate** — it is callable by any maintainer at any time, regardless of the `paused` flag. This is enforced at the contract level and cannot be overridden by the admin keypair.

### 6.2 Direct Contract Interaction (No Frontend Required)

Any maintainer can claim directly via Soroban CLI:

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source maintainer-keypair \
  --network mainnet \
  -- \
  claim \
  --maintainer $MAINTAINER_ADDRESS \
  --organization $ORG_ID
```

### 6.3 Publish Claim Instructions

After the frontend is taken down, publish a permanent GitHub Gist with the above CLI command pre-filled with the contract ID. Pin this Gist to the repository.

### 6.4 Minimum Claim Window

The V1 contract will remain deployed on-chain for a minimum of **2 years** after the sunset announcement. Stellar ledger storage fees are pre-funded via the admin account's XLM balance.

---

## 7. Emergency Rollback

If the pause was triggered in error:

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network mainnet \
  -- \
  unpause
```

Announce the rollback on all channels within **30 minutes**.

---

## 8. Contacts & Escalation

| Role | Responsibility |
|---|---|
| Project Lead | Final decision authority on sunset |
| Security Lead | Vulnerability assessment & contract pause |
| DevOps | Snapshot scripts, IPFS pinning, Vercel env vars |
| Community Manager | Discord / Twitter announcements |

For urgent issues, open a GitHub Issue tagged `P0` and ping the Security Lead directly.
