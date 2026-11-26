import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Aanch studio desk",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
