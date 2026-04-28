---
id: webhooks
title: Connecting Webhooks
sidebar_label: Connecting Webhooks
---

# Connecting Webhooks

Webhooks let you receive real-time HTTP notifications when payout events occur on-chain (e.g., a maintainer claims a payout, an org is funded).

## Register a Webhook Endpoint

```bash title="cURL"
curl -X POST https://api.tradeflow.app/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/hooks/very-princess",
    "events": ["payout.claimed", "org.funded"],
    "secret": "your-signing-secret"
  }'
```

```js title="Node.js"
const webhook = await fetch("https://api.tradeflow.app/webhooks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://your-server.com/hooks/very-princess",
    events: ["payout.claimed", "org.funded"],
    secret: "your-signing-secret",
  }),
}).then((r) => r.json());
```

```python title="Python"
import requests

webhook = requests.post(
    "https://api.tradeflow.app/webhooks",
    json={
        "url": "https://your-server.com/hooks/very-princess",
        "events": ["payout.claimed", "org.funded"],
        "secret": "your-signing-secret",
    },
).json()
```

## Webhook Payload

Every webhook POST contains a JSON body:

```json
{
  "event": "payout.claimed",
  "timestamp": "2026-01-01T00:00:00Z",
  "data": {
    "org_id": "my-org",
    "maintainer": "G...",
    "amount_stroops": 5000000000,
    "tx_hash": "abc123..."
  }
}
```

## Verifying the Signature

Each request includes an `X-Webhook-Signature` header. Verify it to ensure the payload came from very-princess:

```js title="Node.js (Express)"
import crypto from "crypto";

app.post("/hooks/very-princess", (req, res) => {
  const sig = req.headers["x-webhook-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (sig !== `sha256=${expected}`) {
    return res.status(401).send("Invalid signature");
  }
  // process event...
  res.sendStatus(200);
});
```

```python title="Python (Flask)"
import hmac, hashlib, json
from flask import request, abort

@app.route("/hooks/very-princess", methods=["POST"])
def webhook():
    sig = request.headers.get("X-Webhook-Signature", "")
    body = request.get_data()
    expected = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(sig, expected):
        abort(401)
    # process event...
    return "", 200
```

## Available Events

| Event | Description |
|---|---|
| `payout.claimed` | A maintainer successfully claimed their payout |
| `org.funded` | An organization's escrow received new XLM |
| `org.registered` | A new organization was registered |
| `payout.allocated` | A payout was allocated to a maintainer |

## Retry Policy

Failed deliveries (non-2xx response or timeout) are retried up to **5 times** with exponential backoff: 1 min, 5 min, 30 min, 2 hr, 8 hr.
