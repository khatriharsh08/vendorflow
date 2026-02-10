# Cloud Security & Deployment Guidelines

## 1. Environment Configuration
- **NEVER** commit `.env` files to version control.
- Use `APP_DEBUG=false` in production.
- Set `APP_ENV=production`.
- Ensure `APP_KEY` is rotated periodically.

## 2. Session & Cookie Security
- `SESSION_SECURE_COOKIE=true` (Requires HTTPS)
- `SESSION_HTTP_ONLY=true` (Prevents XSS access to cookies)
- `SESSION_SAME_SITE=lax` or `strict`
- Use Redis or Database for session storage in production (`SESSION_DRIVER=redis`).

## 3. Database Security
- Use a dedicated database user with limited privileges.
- Whitelist Application IP addresses for Database access.
- Enable encryption at rest for the database (AWS RDS / Azure SQL).

## 4. Network Security (WAF)
- **AWS WAF** / **Cloudflare**:
    - Enable rate limiting.
    - Block common SQLi and XSS patterns.
    - Restrict access to `/admin` routes to specific VPNs or IPs if possible.

## 5. Data Protection
- **Attribute Encryption**: The following fields are encrypted in the database:
    - `tax_id`
    - `pan_number`
    - `bank_account_number`
    - `bank_ifsc`
- **Backups**: Ensure automated backups are enabled and encrypted.

## 6. Headers (Enforced by Middleware)
- `Strict-Transport-Security`: Enforces HTTPS.
- `X-Frame-Options: DENY`: Prevents clickjacking.
- `Content-Security-Policy`: Restricts script sources.

## 7. Logging & Monitoring
- Configure specific logging channels for security events.
- Monitor for `403 Forbidden` and `401 Unauthorized` spikes.
