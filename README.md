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

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS v4
- Supabase Auth + PostgreSQL
- Vitest + Playwright
- Vercel

Phiên bản chính xác nằm trong `package.json` và `package-lock.json`.

## Chạy local

```bash
git clone https://github.com/Thunderkill016/AtoEnglish.git
cd AtoEnglish
npm install
cp .env.example .env.local
npm run dev
```

Các flow dùng Supabase cần tối thiểu:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
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
- Curriculum đang tồn tại: `src/lib/data/units/`
- Database migrations: `supabase/migrations/`
- Generated DB types: `src/types/supabase.ts`
- CI chính: `.github/workflows/verify.yml`

Code, migrations, config và tests mô tả hệ thống đang chạy; tài liệu không được phép ghi đè thực tế đó.

## Release consistency

GitHub + Supabase đã được đồng bộ lại trong đợt reset 2026-09-06. Vercel production vẫn phải được đối chiếu với exact `main` trước lần release tiếp theo; theo dõi tại issue #152.

Không coi preview deployment hoặc CI xanh là bằng chứng production đã đồng bộ.

## License

Private project — © 2026 AtoEnglish
