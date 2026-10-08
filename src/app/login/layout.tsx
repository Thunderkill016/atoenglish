import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description:
    "Đăng nhập hoặc tạo tài khoản AtoEnglish để tiếp tục lộ trình học tiếng Anh.",
};

export default function LoginLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
