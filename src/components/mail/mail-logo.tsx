import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MailLogo() {
  return (
    <div className="flex items-center gap-2">
      <Mail className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold font-headline">MailWise</h1>
    </div>
  );
}
