---
id: api-reference
title: API Reference
sidebar_label: REST API
---

# API Reference

The very-princess REST API is served by the Fastify backend at `https://api.tradeflow.app`.

:::tip OpenAPI / Swagger
The full machine-readable spec is available at [`/api-docs/json`](https://api.tradeflow.app/api-docs/json).
Import it into Postman, Insomnia, or any OpenAPI-compatible tool.
:::

## Base URL

```
https://api.tradeflow.app
```

## Authentication

Pass your API key in the `Authorization` header:

```
Authorization: Bearer <your-api-key>
```

---

## Organizations

### `GET /orgs`

List all registered organizations.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | Max results per page |
| `offset` | integer | 0 | Pagination offset |

**Response**

```json
{
  "data": [
    {
      "org_id": "stellar",
      "admin": "G...",
      "balance_stroops": 10000000000,
      "maintainer_count": 5
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### `GET /orgs/:org_id`

Get a single organization by ID.

**Response**

```json
{
  "org_id": "stellar",
  "admin": "G...",
  "balance_stroops": 10000000000,
  "maintainers": [
    { "address": "G...", "allocated_stroops": 5000000000 }
  ]
}
```

---

### `POST /orgs`

Register a new organization. Requires a signed transaction from the admin wallet.

**Request body**

```json
{
  "org_id": "my-org",
  "admin": "G..."
}
```

---

## Payouts

### `GET /orgs/:org_id/payouts`

List payout allocations for an organization.

---

### `POST /orgs/:org_id/payouts`

Allocate a payout to a maintainer.

**Request body**

```json
{
  "maintainer": "G...",
  "amount_stroops": 5000000000
}
```

---

## Webhooks

### `GET /webhooks`

List registered webhooks for your account.

---

### `POST /webhooks`

Register a new webhook. See [Connecting Webhooks](./webhooks) for full details.

---

### `DELETE /webhooks/:id`

Remove a webhook registration.
