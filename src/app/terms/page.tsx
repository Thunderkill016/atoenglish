import Link from "next/link";
import type { Metadata } from "next";
import { Screen, LargeTitle, Prose } from "@/components/design-system";

export const metadata: Metadata = {
  title: "Điều khoản Sử dụng | AtoEnglish",
  description: "Điều khoản và điều kiện sử dụng dịch vụ AtoEnglish.",
};

export default function TermsPage() {
  return (
    <Screen narrow>
      <main id="main-content">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-block transition-colors"
        >
          ← Trang chủ
        </Link>

        <LargeTitle subtitle="Cập nhật lần cuối: Tháng 6 năm 2025">
          Điều khoản Sử dụng
        </LargeTitle>

        <Prose>
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold">
              1. Chấp nhận Điều khoản
            </h2>
            <p>
              Bằng cách truy cập và sử dụng AtoEnglish, bạn đồng ý với các điều
              khoản và điều kiện này. Nếu bạn không đồng ý, vui lòng không sử
              dụng dịch vụ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold">2. Mô tả Dịch vụ</h2>
            <p>
              AtoEnglish là nền tảng học tiếng Anh trực tuyến (Web App) cung
              cấp:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Bài học theo lộ trình CEFR từ A1 đến B2.</li>
              <li>
                Hệ thống ôn tập thẻ từ vựng thông minh (FSRS Spaced Repetition).
              </li>
              <li>Luyện nói phản xạ với nhận diện giọng nói từ trình duyệt.</li>
              <li>Theo dõi tiến độ và thói quen học hàng ngày.</li>
            </ul>
            <p>
              Dịch vụ hiện đang trong giai đoạn <strong>Open Beta</strong> và
              hoàn toàn miễn phí.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold">
              3. Tài khoản Người dùng
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.
              </li>
              <li>Chỉ được tạo một tài khoản cho mỗi cá nhân.</li>
              <li>
                Không được sử dụng tài khoản cho mục đích thương mại hoặc chia
                sẻ hàng loạt.
              </li>
              <li>
                AtoEnglish có quyền tạm ngưng tài khoản vi phạm điều khoản.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold">4. Sở hữu Trí tuệ</h2>
            <p>
              Toàn bộ nội dung bài học, thiết kế giao diện, và mã nguồn thuộc sở
              hữu của AtoEnglish. Bạn không được sao chép, phân phối lại hoặc sử
              dụng cho mục đích thương mại mà không có sự cho phép bằng văn bản.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold">
              5. Giới hạn Trách nhiệm
            </h2>
            <p>
              AtoEnglish đang trong giai đoạn phát triển và có thể có lỗi hoặc
              gián đoạn dịch vụ. Chúng tôi không chịu trách nhiệm về bất kỳ
              thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng
              dịch vụ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold">
              6. Thay đổi Điều khoản
            </h2>
            <p>
              Chúng tôi có thể cập nhật điều khoản này theo thời gian. Thông báo
              sẽ được gửi qua email đã đăng ký hoặc thông báo trên ứng dụng.
              Việc tiếp tục sử dụng sau khi có thay đổi đồng nghĩa với việc bạn
              chấp nhận điều khoản mới.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold">7. Liên hệ</h2>
            <p>
              Mọi câu hỏi về điều khoản sử dụng, vui lòng liên hệ:{" "}
              <a
                href="mailto:support@atoenglish.com"
                className="text-primary underline hover:no-underline font-medium"
              >
                support@atoenglish.com
              </a>
            </p>
          </section>
        </Prose>

        <div className="pt-8 border-t border-border/40 flex gap-4 text-sm">
          <Link
            href="/privacy"
            className="text-primary font-semibold hover:underline"
          >
            Chính sách Bảo mật →
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
    </Screen>
  );
}
