import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'MailWise',
  description: 'A beautiful mail box just like Gmail\'s mail workspace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={cn("font-body antialiased", 'bg-background')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}