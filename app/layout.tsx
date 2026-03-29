import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { APP_DESCRIPTION, APP_NAME } from "@/constants/platform";
import "@/app/globals.css";

const headingFont = Sora({
  subsets: ["latin"],
  variable: "--font-heading"
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: APP_DESCRIPTION
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} font-body antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
