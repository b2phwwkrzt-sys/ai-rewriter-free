import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "ClearRewrite — Free AI Paraphraser",
  description: "Rewrite English text for clarity, tone, and readability.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

