# Security Policy

> **Document status:** canonical security disclosure and operational policy
> **Governing authority:** [docs/project/SOURCE_OF_TRUTH.md](docs/project/SOURCE_OF_TRUTH.md)

## Supported Versions

| Version              | Supported |
| -------------------- | --------- |
| Latest (main branch) | ✅        |
| Older releases       | ❌        |

## Reporting a Vulnerability

**Vui lòng KHÔNG report lỗ hổng bảo mật qua GitHub Issues public.**

Nếu bạn phát hiện lỗ hổng bảo mật, hãy liên hệ qua:

- **Email**: [thunderkill016@gmail.com](mailto:thunderkill016@gmail.com)
- **GitHub Private Advisory**: [Security Advisories](https://github.com/Thunderkill016/AtoEnglish/security/advisories/new)

Chúng tôi sẽ phản hồi trong vòng **48 giờ** và cố gắng vá lỗi trong **7 ngày** với các lỗ hổng nghiêm trọng.

## Security Architecture

### Authentication

- **Neon Managed Auth (Better Auth)**: Google OAuth 2.0 + Email/Password
- Session tokens lưu trong httpOnly cookies (không accessible từ JS)
- `src/proxy.ts` guard tất cả routes; `/login`, `/auth/*`, `/api/auth/*` được rate-limit riêng

### Database

- **Row Level Security (RLS)** bật trên tất cả tables (Neon Postgres)
- Policy pattern: `(select auth.uid()) = user_id`
- Write operations vào bảng điểm/level (`user_progress`, `user_lesson_progress`) chỉ qua RPC có guard `auth_uid()` — client không thể tự forge XP/level/streak
- Zero Path guest sessions dùng capability-secret model (HttpOnly cookie + server-side hash), không đếm được/tamper được session của người khác
- Không có route nào expose raw SQL

### Rate Limiting

- Auth endpoints (`/login`, `/auth/*`, `/api/auth/*`): **30 req/60s per client IP**, enforced bởi `AuthRateLimiterDO` (Durable Object — strict per-key counting), key lấy từ `cf-connecting-ip` (không spoof được qua X-Forwarded-For)
- Server Actions có write operations đều có rate limiting (Upstash Redis khi configured, in-memory cho local dev)
- `completeUnit`: 10 lần/giờ/IP
- `saveCardToSRS`: 60 lần/phút/IP
- `reviewCard`: 120 lần/phút/IP

### HTTP Security Headers

Tất cả routes có các headers:

- `Content-Security-Policy` (CSP) — whitelist chỉ trusted domains
- `Strict-Transport-Security` — HSTS với `max-age=63072000; preload`
- `X-Frame-Options: DENY` — chống clickjacking
- `X-Content-Type-Options: nosniff`
- `Cross-Origin-Opener-Policy: same-origin`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: tắt camera, chỉ cho microphone (self)

### Input Validation

- Tất cả Server Actions validate input với **Zod schemas**
- Không có raw string interpolation trong SQL queries
- User IDs luôn lấy từ server-side auth session — không nhận từ client

### Dependency Security

- `npm audit` chạy trong CI pipeline
- Dependencies được review định kỳ
