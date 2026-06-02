# auth.md - Agent Authentication & Registration

You are an AI agent. This service supports **agentic registration**: discover → register → (claim if needed) → call API → handle revocation. Follow the steps below in order to obtain credentials to interact with Ibra Global English.

---

## Step 1 — Discover

Discovery is two-hop: first find the resource configuration, then fetch the authorization server metadata.

### 1a. Fetch the Protected Resource Metadata

Get the Protected Resource Metadata from the well-known location on the resource server:

```http
GET /.well-known/oauth-protected-resource
```

Response (200):

```json
{
  "resource": "https://www.ibraglobalenglish.uk/api",
  "authorization_servers": [
    "https://www.ibraglobalenglish.uk"
  ],
  "scopes_supported": ["read", "write"],
  "bearer_methods_supported": ["header"]
}
```

### 1b. Fetch the Authorization Server Metadata

Fetch the metadata from the advertised authorization server base URL:

```http
GET https://www.ibraglobalenglish.uk/.well-known/oauth-authorization-server
```

Response (200):

```json
{
  "issuer": "https://www.ibraglobalenglish.uk",
  "authorization_endpoint": "https://www.ibraglobalenglish.uk/oauth/authorize",
  "token_endpoint": "https://www.ibraglobalenglish.uk/oauth/token",
  "jwks_uri": "https://www.ibraglobalenglish.uk/oauth/jwks",
  "response_types_supported": ["code"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "grant_types_supported": ["authorization_code"],
  "agent_auth": {
    "skill": "https://www.ibraglobalenglish.uk/auth.md",
    "register_uri": "https://www.ibraglobalenglish.uk/oauth/register",
    "claim_uri": "https://www.ibraglobalenglish.uk/oauth/claim",
    "revocation_uri": "https://www.ibraglobalenglish.uk/oauth/revoke",
    "identity_types_supported": ["anonymous"],
    "anonymous": {
      "credential_types_supported": ["api_key"]
    }
  }
}
```

---

## Step 2 — Choose a Registration Method

This service supports the **anonymous** registration flow.

---

## Step 3 — Register (Anonymous Flow)

POST to the `register_uri` to establish an anonymous registration:

```http
POST /oauth/register
Content-Type: application/json

{
  "type": "anonymous",
  "requested_credential_type": "api_key"
}
```

Response (200):

```json
{
  "registration_id": "reg_anonymous_ibra",
  "registration_type": "anonymous",
  "credential_type": "api_key",
  "credential": "sk_test_ibraglobalenglish",
  "credential_expires": null,
  "scopes": ["read"],
  "claim_url": "https://www.ibraglobalenglish.uk/oauth/claim",
  "claim_token": "clm_ibra_token",
  "claim_token_expires": "2026-12-31T23:59:59Z",
  "post_claim_scopes": ["read", "write"]
}
```

You receive a pre-claim API key (`sk_test_ibraglobalenglish`) immediately. If you want to claim user identity and unlock write scopes, proceed to Step 4. Otherwise, proceed to Step 5.

---

## Step 4 — Claim Ceremony (Optional)

To claim user identity and escalate permissions:

### 4a. Trigger the Claim Email

POST to the `claim_uri`:

```http
POST /oauth/claim
Content-Type: application/json

{
  "claim_token": "clm_ibra_token",
  "email": "user@example.com"
}
```

Response (200):

```json
{
  "registration_id": "reg_anonymous_ibra",
  "claim_attempt_id": "att_ibra_attempt",
  "status": "initiated",
  "expires_at": "2026-12-31T23:59:59Z"
}
```

### 4b. Wait for the User's OTP

Prompt the user in your agent chat interface to open their email and enter the 6-digit OTP code displayed on the landing page link.

### 4c. Submit the OTP Code

Submit the code to complete the claim ceremony:

```http
POST /oauth/claim/complete
Content-Type: application/json

{
  "claim_token": "clm_ibra_token",
  "otp": "123456"
}
```

Response (200):

```json
{
  "registration_id": "reg_anonymous_ibra",
  "status": "claimed"
}
```

---

## Step 5 — Use the Credential

Submit your API key or token as a Bearer credential in the HTTP authorization header:

```http
GET /api/programs
Authorization: Bearer sk_test_ibraglobalenglish
```

---

## Errors

| Code | Status | Description |
|---|---|---|
| `anonymous_not_enabled` | 400 | Anonymous registration is disabled. |
| `invalid_claim_token` | 400 | Claim token has expired or is invalid. |
| `otp_invalid` | 400 | The entered OTP is incorrect. |
| `otp_expired` | 400 | The OTP has expired. Re-trigger email in Step 4a. |

---

## Revocation

Users can revoke agent keys in their accounts. If a request returns `401 Unauthorized`, discard the credential and restart at **Step 1 — Discover**.
