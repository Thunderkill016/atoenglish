#!/usr/bin/env node
/**
 * audit-code.mjs
 * Custom static codebase audit tool for AtoEnglish.
 * Checks for:
 * 1. Next.js 16 async APIs (cookies, headers, createClient from server, params) called without await.
 * 2. Rate limiting & input validation (Zod) on DB-writing Server Actions.
 * 3. Banned console.log/console.error and 'as any' casts.
 * 4. Mobile bottom padding on (main) page components (missing pb-20/pb-28/pb-32 or paddingBottom: 100/112).
 * 5. Database tables and fields correctness.
 * 6. Curriculum configuration and data file mapping.
 */

import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve('src');
const ACTIONS_DIR = path.resolve('src/app/actions');
const MAIN_PAGES_DIR = path.resolve('src/app/(main)');
const UNITS_DATA_DIR = path.resolve('src/lib/data/units');

let totalFilesChecked = 0;
const violations = [];

// Helper: Traverse directory recursively
function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      // Skip build, test, and node modules
      if (['.next', '.next-dev', 'node_modules', '.git', 'dist', '__tests__'].includes(file.name)) continue;
      getFiles(filePath, fileList);
    } else if (file.isFile() && /\.(ts|tsx|js|jsx|mjs)$/.test(file.name)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Helper: check if a line is a comment
function isCommentLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.endsWith('*/');
}

// ─── 1. Run checks on all files ─────────────────────────────────────────────
const allFiles = getFiles(SRC_DIR);

for (const file of allFiles) {
  totalFilesChecked++;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), file);

  const isClientComponent = content.includes('"use client"') || content.includes("'use client'");
  const isServerActionFile = file.startsWith(ACTIONS_DIR) || content.includes('"use server"') || content.includes("'use server'");
  const isAppFile = file.includes(path.join('src', 'app'));

  // Line-by-line checks
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    if (isCommentLine(line)) return;

    let checkLine = line;
    const commentIdx = line.indexOf('//');
    if (commentIdx !== -1) {
      checkLine = line.substring(0, commentIdx);
    }

    // A. Banned console.log and console.error
    if (checkLine.includes('console.log(') || checkLine.includes('console.error(')) {
      // Exclude comments or explicit disables
      if (!checkLine.includes('eslint-disable')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          type: 'BANNED_CODE',
          message: `Dùng console.* trong code: "${line.trim()}"`,
          severity: 'HIGH'
        });
      }
    }

    // B. Banned 'as any' casts
    if (/\bas\s+any\b/.test(checkLine) || /:\s*any\b/.test(checkLine)) {
      if (!checkLine.includes('eslint-disable')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          type: 'BANNED_CODE',
          message: `Ép kiểu 'as any' hoặc ': any': "${line.trim()}"`,
          severity: 'HIGH'
        });
      }
    }

    // C. Table names/DB columns validation
    if (checkLine.includes('completed_lessons')) {
      violations.push({
        file: relativePath,
        line: lineNum,
        type: 'DATABASE',
        message: `Sử dụng tên bảng sai 'completed_lessons' (đúng: 'user_lesson_progress')`,
        severity: 'CRITICAL'
      });
    }
    if (checkLine.includes('user_profiles')) {
      violations.push({
        file: relativePath,
        line: lineNum,
        type: 'DATABASE',
        message: `Sử dụng tên bảng sai 'user_profiles' (đúng: 'user_progress')`,
        severity: 'CRITICAL'
      });
    }
    if (checkLine.includes('daily_xp_goal')) {
      const isDbQuery = checkLine.includes('.select(') || checkLine.includes('.update(') || checkLine.includes('.insert(') || checkLine.includes('.upsert(') || checkLine.includes('.from(');
      if (isDbQuery) {
        violations.push({
          file: relativePath,
          line: lineNum,
          type: 'DATABASE',
          message: `Tham chiếu cột 'daily_xp_goal' không tồn tại trong DB`,
          severity: 'CRITICAL'
        });
      }
    }

    // D. Next.js 16 Async API - cookies(), headers(), createClient()
    if (isAppFile && !isClientComponent) {
      if (checkLine.includes('cookies()') && !checkLine.includes('await cookies()')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          type: 'NEXTJS_16',
          message: `Gọi cookies() đồng bộ thay vì await cookies() trong Server Component`,
          severity: 'CRITICAL'
        });
      }
      if (checkLine.includes('headers()') && !checkLine.includes('await headers()')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          type: 'NEXTJS_16',
          message: `Gọi headers() đồng bộ thay vì await headers() trong Server Component`,
          severity: 'CRITICAL'
        });
      }
      if (checkLine.includes('createClient()') && !checkLine.includes('await createClient()') && checkLine.includes('supabase/server')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          type: 'NEXTJS_16',
          message: `Gọi createClient() đồng bộ thay vì await createClient() trong Server Component`,
          severity: 'CRITICAL'
        });
      }
    }
  });

  // Next.js 16 Server Component params / searchParams check
  if (isAppFile && !isClientComponent && file.endsWith('page.tsx')) {
    // If it mentions props, let's verify if they await params or searchParams if used
    const hasParamsWord = content.includes('params');
    const hasSearchParamsWord = content.includes('searchParams');
    const hasAwaitParams = content.includes('await params') || content.includes('await props.params') || content.includes('await props');
    const hasAwaitSearchParams = content.includes('await searchParams') || content.includes('await props.searchParams');

    if (hasParamsWord && !hasAwaitParams && content.includes('params:')) {
      violations.push({
        file: relativePath,
        line: 1,
        type: 'NEXTJS_16',
        message: `params khai báo trong page.tsx nhưng chưa được await. Next.js 16 yêu cầu await params.`,
        severity: 'HIGH'
      });
    }
    if (hasSearchParamsWord && !hasAwaitSearchParams && content.includes('searchParams:')) {
      violations.push({
        file: relativePath,
        line: 1,
        type: 'NEXTJS_16',
        message: `searchParams khai báo trong page.tsx nhưng chưa được await. Next.js 16 yêu cầu await searchParams.`,
        severity: 'HIGH'
      });
    }
  }

  // E. Server Action Rate-limiting check
  if (isServerActionFile) {
    const writeOperations = ['.from(', '.insert(', '.update(', '.upsert(', '.delete('];
    const hasWriteOperation = writeOperations.some(op => content.includes(op));

    if (hasWriteOperation) {
      // Needs rate limiter
      const hasLimiter = content.includes('limiter') || content.includes('Limiter') || content.includes('rateLimit');
      if (!hasLimiter) {
        violations.push({
          file: relativePath,
          line: 1,
          type: 'SECURITY',
          message: `Server Action thực hiện ghi DB nhưng thiếu Rate Limiting check`,
          severity: 'HIGH'
        });
      }
      const hasValidation = content.includes('Schema.safeParse') || content.includes('.safeParse') || content.includes('Schema.parse') || content.includes('z.object');
      if (!hasValidation) {
        violations.push({
          file: relativePath,
          line: 1,
          type: 'SECURITY',
          message: `Server Action thực hiện ghi DB nhưng thiếu Zod validation`,
          severity: 'MEDIUM'
        });
      }
    }
  }
}

// ─── 2. Mobile Layout Padding Check ─────────────────────────────────────────
function getRouteDirs(dir, dirs = []) {
  if (!fs.existsSync(dir)) return dirs;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let hasPage = false;
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      getRouteDirs(filePath, dirs);
    } else if (file.isFile() && file.name === 'page.tsx') {
      hasPage = true;
    }
  }
  if (hasPage) {
    dirs.push(dir);
  }
  return dirs;
}

const routeDirs = getRouteDirs(MAIN_PAGES_DIR);

for (const routeDir of routeDirs) {
  const relativeRoute = path.relative(MAIN_PAGES_DIR, routeDir) || 'root';
  // Whitelist routes that delegate layout to shared components (e.g. session runner has pb-24)
  if (relativeRoute === 'learn/[unitSlug]') continue;
  // Get all TSX files in this route directory (recursively)
  const routeFiles = getFiles(routeDir).filter(f => f.endsWith('.tsx'));
  let hasPadding = false;

  for (const file of routeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const matchesPadding = /pb-\d+/.test(content) || 
                           /paddingBottom:\s*(\d+|['"]\d+px['"])/.test(content) || 
                           /style=\{\{\s*minHeight:\s*['"]100dvh['"].*paddingBottom:/.test(content) ||
                           content.includes('style={{ minHeight: "100dvh"') ||
                           content.includes('pb-20') ||
                           content.includes('pb-24') ||
                           content.includes('pb-28') ||
                           content.includes('pb-32') ||
                           content.includes('pb-36') ||
                           content.includes('pb-40');
    if (matchesPadding) {
      hasPadding = true;
      break;
    }
  }

  if (!hasPadding) {
    violations.push({
      file: path.relative(process.cwd(), path.join(routeDir, 'page.tsx')),
      line: 1,
      type: 'MOBILE_UX',
      message: `Tuyến đường (main)/${relativeRoute} thiếu bottom padding trên mobile để tránh che khuất bởi BottomNav`,
      severity: 'MEDIUM'
    });
  }
}

// ─── 3. Curriculum Integrity Checks ──────────────────────────────────────────
const unitsFile = path.resolve('src/lib/constants/units.ts');
if (fs.existsSync(unitsFile)) {
  const unitsContent = fs.readFileSync(unitsFile, 'utf8');
  // Match ids like "unit-a0-1", "unit-1", "unit-42"
  const unitIdMatches = [...unitsContent.matchAll(/id:\s*["'](unit-[a-zA-Z0-9-]+)["']/g)].map(m => m[1]);

  for (const id of unitIdMatches) {
    // Map id to file:
    // e.g. "unit-a0-1" -> "unitA01.ts" or similar
    // e.g. "unit-1" -> "unit1.ts"
    let expectedFile;
    const parts = id.split('-');
    const num = parts[parts.length - 1]; // "1"
    if (id.startsWith('unit-a0-')) {
      expectedFile = `unitA0${num}.ts`;
    } else {
      expectedFile = `unit${num}.ts`;
    }

    const filePath = path.join(UNITS_DATA_DIR, expectedFile);
    if (!fs.existsSync(filePath)) {
      violations.push({
        file: 'src/lib/constants/units.ts',
        line: 1,
        type: 'CURRICULUM',
        message: `Unit ID '${id}' được khai báo nhưng không tìm thấy file dữ liệu tương ứng: '${expectedFile}'`,
        severity: 'HIGH'
      });
    } else {
      // Verify file matches the unit ID internally (check unitId: "...")
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (!fileContent.includes(`unitId: "${id}"`) && !fileContent.includes(`unitId: '${id}'`)) {
        violations.push({
          file: `src/lib/data/units/${expectedFile}`,
          line: 1,
          type: 'CURRICULUM',
          message: `Nội dung file '${expectedFile}' không khớp với unit ID dự kiến '${id}'`,
          severity: 'HIGH'
        });
      }
    }
  }
}

// ─── Print results ──────────────────────────────────────────────────────────
console.log(`\n=== ATOENGLISH CODEBASE AUDIT RESULTS ===`);
console.log(`Đã quét qua ${totalFilesChecked} files mã nguồn.`);

if (violations.length === 0) {
  console.log(`\n✓ Tuyệt vời! Không phát hiện lỗi tĩnh hoặc xung đột logic nào. Codebase ĐẠT TIÊU CHUẨN! 🎉\n`);
  process.exit(0);
} else {
  console.log(`\n⚠️ Phát hiện ${violations.length} điểm cần sửa đổi:\n`);

  // Group by type
  const grouped = violations.reduce((acc, curr) => {
    acc[curr.type] = acc[curr.type] || [];
    acc[curr.type].push(curr);
    return acc;
  }, {});

  for (const [type, list] of Object.entries(grouped)) {
    console.log(`[Category: ${type}]`);
    list.forEach(v => {
      console.log(`  - [${v.severity}] ${v.file}:${v.line} -> ${v.message}`);
    });
    console.log();
  }

  process.exit(1);
}
