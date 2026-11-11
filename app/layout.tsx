import {SessionLink} from "./session-link";
import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anansi — Every story, woven across every tongue",
  description: "isiXhosa stories, linked English translations and human review, with the original voice preserved.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><a href="#content" className="sr-only focus:not-sr-only">Skip to content</a><header className="app-header"><Link href="/" className="app-brand"><span aria-hidden="true" className="brand-mark"/>Anansi</Link><nav aria-label="Main navigation"><SessionLink href="/discover">Explore</SessionLink><SessionLink href="/stories/new">New story</SessionLink><SessionLink href="/account">Profile</SessionLink></nav></header><div id="content" className="app-content">{children}</div><footer className="app-footer">Every story, woven across every tongue. AI drafts; people check the meaning.</footer></body>
    </html>
  );
}
