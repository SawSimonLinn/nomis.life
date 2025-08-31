import { Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code2 className="h-4 w-4" />
          <span>
            Built by Nomis.Life. The source code is available on GitHub.
          </span>
        </div>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Nomis.Life. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
