---
id: api-limits
title: Understanding API Limits
sidebar_label: API Limits
---

# Understanding API Limits

The very-princess REST API enforces rate limits to ensure fair usage and protect the Soroban RPC from overload.

## Default Rate Limits

| Tier | Requests / minute | Burst |
|---|---|---|
| Unauthenticated | 30 | 10 |
| Authenticated (API key) | 300 | 50 |
| Webhook delivery | N/A | N/A |

## Rate Limit Headers

Every API response includes these headers:

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1735689600
```

`X-RateLimit-Reset` is a Unix timestamp indicating when the window resets.

## Handling 429 Responses

When you exceed the limit, the API returns `HTTP 429 Too Many Requests`:

```json
{
  "error": "rate_limit_exceeded",
  "retry_after": 42
}
```

`retry_after` is the number of seconds to wait before retrying.

```js title="Node.js — automatic retry"
async function apiFetch(url, options, retries = 3) {
  const res = await fetch(url, options);
  if (res.status === 429 && retries > 0) {
    const { retry_after } = await res.json();
    await new Promise((r) => setTimeout(r, retry_after * 1000));
    return apiFetch(url, options, retries - 1);
  }
  return res;
}
```

```python title="Python — automatic retry"
import time, requests

def api_fetch(url, **kwargs):
    for attempt in range(3):
        r = requests.get(url, **kwargs)
        if r.status_code == 429:
            time.sleep(r.json().get("retry_after", 60))
            continue
        return r
    raise Exception("Rate limit exceeded after retries")
```

## Pagination

List endpoints return paginated results. Use `limit` and `offset` query parameters:

```bash
GET /orgs?limit=20&offset=40
```

Response:

```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 40
}
```

## Increasing Your Limits

To request a higher rate limit tier, open a GitHub Issue tagged `rate-limit-request` with your use case and expected request volume.
