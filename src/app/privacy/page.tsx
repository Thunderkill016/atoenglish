import Link from "next/link";
import type { Metadata } from "next";
import { Screen, LargeTitle, Prose } from "@/components/design-system";

export const metadata: Metadata = {
  title: "Chính sách Bảo mật | AtoEnglish",
  description: "Chính sách bảo mật dữ liệu người dùng của AtoEnglish.",
};

export default function PrivacyPage() {
  return (
    <Screen narrow>
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-block transition-colors"
      >
        ← Trang chủ
      </Link>

      <LargeTitle subtitle="Cập nhật lần cuối: Tháng 6 năm 2025">
        Chính sách Bảo mật
      </LargeTitle>

      <Prose>
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold">1. Thông tin chúng tôi thu thập</h2>
          <p>
            Khi bạn đăng ký và sử dụng AtoEnglish, chúng tôi thu thập các thông tin sau:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Thông tin tài khoản</strong>: Email, tên hiển thị (từ Google OAuth hoặc bạn cung cấp).</li>
            <li><strong>Dữ liệu học tập</strong>: Tiến độ bài học, điểm XP, streak, lịch sử ôn tập thẻ từ vựng (SRS).</li>
            <li><strong>Dữ liệu kỹ thuật</strong>: Loại trình duyệt, thiết bị, dữ liệu hiệu suất ẩn danh.</li>
          </ul>
          <p>
            Chúng tôi <strong>không thu thập</strong> dữ liệu giọng nói — tính năng luyện nói hoạt động hoàn toàn phía trình duyệt của bạn và không gửi lên máy chủ.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold">2. Cách chúng tôi sử dụng thông tin</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Cung cấp và cải thiện dịch vụ học tập cá nhân hóa.</li>
            <li>Lưu lịch sử tiến độ và ôn tập theo thuật toán FSRS.</li>
            <li>Gửi thông báo nhắc nhở học hàng ngày (nếu bạn đồng ý).</li>
            <li>Phân tích tổng hợp ẩn danh để cải thiện nội dung bài học.</li>
          </ul>
          <p>
            Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold">3. Lưu trữ và bảo mật dữ liệu</h2>
          <p>
            Dữ liệu được lưu trữ trên <strong>Neon Postgres</strong> với mã hóa TLS và chính sách bảo mật hàng đầu. Chúng tôi áp dụng Row Level Security (RLS) — đảm bảo mỗi người dùng chỉ truy cập được dữ liệu của chính họ.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold">4. Quyền của bạn</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân của bạn.</li>
            <li>Rút lại quyền truy cập Google OAuth bất cứ lúc nào.</li>
            <li>Xóa tài khoản hoàn toàn bằng cách liên hệ với chúng tôi.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold">5. Liên hệ</h2>
          <p>
            Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ:{" "}
            <a
              href="mailto:support@atoenglish.com"
              className="text-emerald-600 dark:text-emerald-400 underline hover:no-underline font-medium"
            >
              support@atoenglish.com
            </a>
          </p>
        </section>
      </Prose>

      <div className="pt-8 border-t border-border/40 flex gap-4 text-sm">
        <Link href="/terms" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
          Điều khoản Sử dụng →
        </Link>
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Về trang chủ
        </Link>
      </div>
    </Screen>
  );
}
