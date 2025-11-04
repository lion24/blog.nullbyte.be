# Service Account Authentication

Service accounts provide a secure way for external services (n8n, CI/CD pipelines, scripts, etc.) to authenticate with the blog's admin API using bearer tokens.

## Overview

- **Authentication Method**: Bearer tokens in `Authorization` header
- **Token Format**: `sa_<64_hex_chars>` (e.g., `sa_a1b2c3d4e5f6...`)
- **Storage**: Tokens are hashed using bcrypt before storage
- **Scopes**: Fine-grained permissions for different operations
- **Lifecycle**: Tokens can be revoked but not regenerated

## Quick Start

### 1. Create a Service Account (account needs admin privileges)

```bash
curl -X POST http://localhost:3000/api/admin/service-accounts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<your-session-token>" \
  -d '{
    "name": "n8n Automation",
    "description": "Service account for n8n workflow automation",
    "scopes": ["posts:read", "posts:write", "tags:read"]
  }'
```

Response:
```json
{
  "serviceAccount": {
    "id": "clx...",
    "name": "n8n Automation",
    "description": "Service account for n8n workflow automation",
    "scopes": ["posts:read", "posts:write", "tags:read"],
    "revoked": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": {
      "id": "user123",
      "name": "Admin",
      "email": "admin@example.com"
    }
  },
  "token": "sa_a1b2c3d4e5f6789...",
  "warning": "This token will not be shown again. Save it securely."
}
```

**⚠️ IMPORTANT**: Save the token immediately! It will never be shown again.

### 2. Use the Token

Include the token in the `Authorization` header:

```bash
curl http://localhost:3000/api/admin/posts \
  -H "Authorization: Bearer sa_a1b2c3d4e5f6789..."
```

## Available Scopes

Service accounts use scopes to limit what operations they can perform:

| Scope | Description |
|-------|-------------|
| `posts:read` | Read posts (GET endpoints) |
| `posts:write` | Create and update posts |
| `posts:delete` | Delete posts |
| `tags:read` | Read tags |
| `tags:write` | Create and update tags |
| `users:read` | Read user information |
| `admin:full` | Full admin access (all operations) |

## API Endpoints

### List Service Accounts

```bash
GET /api/admin/service-accounts
```

Returns all service accounts (without token hashes).

### Get Service Account Details

```bash
GET /api/admin/service-accounts/{id}
```

Get details about a specific service account.

### Create Service Account

```bash
POST /api/admin/service-accounts
Content-Type: application/json

{
  "name": "My Service Account",
  "description": "Optional description",
  "scopes": ["posts:read", "posts:write"]
}
```

Returns the service account details and the token (only shown once).

### Revoke Service Account

```bash
PATCH /api/admin/service-accounts/{id}
Content-Type: application/json

{
  "revoked": true
}
```

Revokes the service account. The token will no longer work.

### Delete Service Account

```bash
DELETE /api/admin/service-accounts/{id}
```

Permanently deletes the service account.

## Integration Examples

### n8n Workflow

In your n8n workflow, add an HTTP Request node with:

1. **Authentication**: None (we'll use custom header)
2. **Headers**:
   - Name: `Authorization`
   - Value: `Bearer sa_your_token_here`

### GitHub Actions

```yaml
name: Update Blog Post
on:
  push:
    branches: [main]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Update post
        run: |
          curl -X PATCH https://blog.nullbyte.be/api/admin/posts/my-post \
            -H "Authorization: Bearer ${{ secrets.SERVICE_ACCOUNT_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"published": true}'
```

Store the token in GitHub Secrets as `SERVICE_ACCOUNT_TOKEN`.

### Node.js Script

```javascript
const BLOG_API = 'https://blog.nullbyte.be/api/admin'
const TOKEN = process.env.SERVICE_ACCOUNT_TOKEN

async function getPosts() {
  const response = await fetch(`${BLOG_API}/posts`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  return response.json()
}

getPosts().then(console.log)
```

### Python Script

```python
import os
import requests

BLOG_API = 'https://blog.nullbyte.be/api/admin'
TOKEN = os.environ['SERVICE_ACCOUNT_TOKEN']

def get_posts():
    headers = {
        'Authorization': f'Bearer {TOKEN}'
    }
    
    response = requests.get(f'{BLOG_API}/posts', headers=headers)
    response.raise_for_status()
    
    return response.json()

if __name__ == '__main__':
    posts = get_posts()
    print(posts)
```

## Security Best Practices

### Token Storage

- **Never commit tokens** to version control
- Store tokens in environment variables or secrets managers
- Use different tokens for different environments (dev, staging, prod)

### Scope Management

- **Principle of least privilege**: Only grant necessary scopes
- Create separate tokens for different use cases
- Example: Read-only token for monitoring, write token for automation

### Token Lifecycle

- **Revoke unused tokens** immediately
- Rotate tokens periodically (create new, update systems, revoke old)
- Monitor `lastUsedAt` to identify stale tokens

### Monitoring

Service accounts track:
- `lastUsedAt`: Last successful authentication
- `createdAt`: When the token was created
- `createdBy`: Which admin created the token

Review these regularly to detect anomalies.

## Troubleshooting

### 401 Unauthorized

- Check token format starts with `sa_`
- Verify token is exactly 67 characters (3 prefix + 64 hex)
- Confirm token hasn't been revoked
- Check `Authorization: Bearer` header format

### 403 Forbidden

- Service account is valid but lacks required scopes
- Contact admin to update scopes or create new account

### Token Leaked?

If a token is compromised:

1. **Immediately revoke** the token via API or admin UI
2. Create a new service account with different token
3. Update all systems using the old token
4. Review access logs for suspicious activity

## Technical Details

### Token Generation

- Tokens use cryptographically secure random bytes (`crypto.randomBytes`)
- Format: `sa_` prefix + 32 bytes (64 hex characters)
- Hashed with bcrypt (12 rounds) before storage
- Plain-text token never stored in database

### Authentication Flow

1. Client sends `Authorization: Bearer sa_...` header
2. Server extracts and validates token format
3. Server retrieves all active service accounts
4. Server compares token against each hash using bcrypt
5. On match, updates `lastUsedAt` and authenticates as creating user
6. Request proceeds with user's role and permissions

### Database Schema

```prisma
model ServiceAccount {
  id          String    @id @default(cuid())
  name        String
  description String?
  tokenHash   String    @unique
  scopes      String[]
  revoked     Boolean   @default(false)
  lastUsedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdById String
  createdBy   User      @relation(fields: [createdById], references: [id], onDelete: Cascade)
  
  @@index([revoked])
  @@index([createdById])
}
```

## Future Enhancements

Potential features for future versions:

- [ ] Token expiration dates
- [ ] Rate limiting per service account
- [ ] Audit logs for service account actions
- [ ] IP allowlisting
- [ ] Token rotation without downtime
- [ ] Webhook notifications for token usage
- [ ] Admin UI for service account management
