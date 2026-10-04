"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-6">📚</div>
        <h1 className="text-4xl font-black text-white mb-3">404</h1>
        <p className="text-xl font-bold text-emerald-400 mb-2">
          Trang không tìm thấy
        </p>
        <p className="text-zinc-400 text-sm mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl px-6 py-3 transition-all shadow-md active:scale-95"
          >
            <Home size={18} /> Về Học
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl px-6 py-3 transition-colors"
          >
            <BookOpen size={18} /> Tiếp tục học
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
