import type { Metadata } from "next";
import ReefAppLayout from "@/components/ReefAppLayout";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";


export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Reef: Abstract Search",
  description: "The AI Thinktank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReefAppLayout>{children}</ReefAppLayout>
  );
}
