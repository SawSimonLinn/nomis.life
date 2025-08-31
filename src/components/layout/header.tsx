import Link from 'next/link';
import { Code2, MessagesSquare } from 'lucide-react';
import { UserNav } from '@/components/auth/user-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              Nomis.Life
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Link
              href="/community-chat"
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'hidden sm:flex'
              )}
            >
              <MessagesSquare className="mr-2 h-4 w-4" />
              Community
            </Link>
          <ModeToggle />
          <nav className="flex items-center">
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
