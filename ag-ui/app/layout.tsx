import type { Metadata } from "next";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import CopilotProvider from "./CopilotProvider";

export const metadata: Metadata = {
  title: "Lynqx Console",
  description: "Lynqx headless corporate banking console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">
        <CopilotProvider>{children}</CopilotProvider>
      </body>
    </html>
  );
}
