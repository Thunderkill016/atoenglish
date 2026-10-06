# AtoEnglish 🇻🇳→🇬🇧

> Ứng dụng học tiếng Anh dành cho người Việt.

## Trạng thái dự án

AtoEnglish đã được dọn lại source-of-truth ngày 2026-09-06. Repository hiện **không có product roadmap tự động**; hướng sản phẩm tiếp theo phải được quyết định từ trạng thái code hiện tại và bằng chứng người học, không từ các roadmap/R&D lịch sử.

- Trạng thái hiện tại: [`docs/project/PROJECT_STATE.md`](docs/project/PROJECT_STATE.md)
- Quy tắc source-of-truth: [`docs/project/SOURCE_OF_TRUTH.md`](docs/project/SOURCE_OF_TRUTH.md)
- Quy tắc cho coding agents: [`AGENTS.md`](AGENTS.md)
- Chính sách bảo mật: [`SECURITY.md`](SECURITY.md)

Các tài liệu Nếp, 28-day pilot, Real Talk, YouTube-to-Curriculum, CycleWarden, OpenPronounce, learner-model và các roadmap/spec cũ đã được bỏ khỏi working tree. Lịch sử của chúng vẫn tồn tại trong Git/PR/issue history nếu cần tra cứu.

## Stack

- Next.js 16 / React 19 / TypeScript (vinext → Cloudflare Workers)
- Tailwind CSS v4
- Neon Postgres + Neon Managed Better Auth + Neon Data API
- Vitest + Playwright
- Cloudflare Workers (`deploy:vinext`)

Phiên bản chính xác nằm trong `package.json` và `package-lock.json`.

## Chạy local

```bash
git clone https://github.com/Thunderkill016/AtoEnglish.git
cd AtoEnglish
npm install
cp .env.example .env.local
npm run dev
```

Các flow dùng Neon cần tối thiểu (pull tự động bằng `neon env` khi project đã `neon link`):

```text
DATABASE_URL / DATABASE_URL_UNPOOLED
NEON_AUTH_BASE_URL
NEON_DATA_API_URL
NEXT_PUBLIC_NEON_DATA_API_URL
NEON_AUTH_COOKIE_SECRET   # tự tạo: node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))"
```

Database migrations chạy trên Neon branch:

```bash
npm run db:migrate   # adapt + compat bootstrap + replay toàn bộ migrations
npm run db:test      # pgTAP trust-boundary + RLS suites
```

Không commit secret hoặc `.env.local`.

## Các lệnh chính

```bash
npm run dev
npx tsc --noEmit
npm run lint
npm run test
npm run test:content-standard
npm run test:integration
npm run e2e
npm run build
npm run audit
npm run inventory
```

Không ghi số lượng test cố định vào tài liệu; output CI/test runner là nguồn đúng.

## Source kỹ thuật

- Runtime: `src/`
- Từ điển curated (tách khỏi giáo trình cũ): `src/lib/dict/vocabulary.ts`
- Database migrations: `supabase/migrations/`
- Generated DB types: `src/types/supabase.ts`
- CI chính: `.github/workflows/verify.yml`

Code, migrations, config và tests mô tả hệ thống đang chạy; tài liệu không được phép ghi đè thực tế đó.

## Release consistency

Production chạy trên Cloudflare Workers (deploy qua `npm run deploy:vinext`) với Neon branch `production` làm database. Trước mỗi release, đối chiếu exact `main` commit với Worker version (`npm run check-deploy`) và trạng thái migrations trên branch production.

Không coi preview deployment hoặc CI xanh là bằng chứng production đã đồng bộ.

## License

Private project — © 2026 AtoEnglish
