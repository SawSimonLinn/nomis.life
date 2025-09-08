import { Code2, Github, Linkedin, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-8 border-t border-border/40">
      <div className="container flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
            <Image
                src="/logo.png"
                alt="Nomis.Life Logo"
                width={24}
                height={24}
                className="h-6 w-6"
                data-ai-hint="logo"
            />
            <span className="font-bold sm:inline-block">
                <span className="inline-block transform scale-x-[-1]">N</span>
                omis.Life
            </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code2 className="h-4 w-4" />
          <span>
            Built by Saw Simon Linn.
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="https://github.com/SawSimonLinn" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
              <Github className="h-4 w-4" /> GitHub
            </a>
             <a href="https://www.linkedin.com/in/sawsimonlinn/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
             <a href="https://sawsimonlinn.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
              <Globe className="h-4 w-4" /> Portfolio
            </a>
             <a href="https://simonlinn.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
              <Globe className="h-4 w-4" /> Simon Linn
            </a>
        </div>
         <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <a href="mailto:simon@sawsimonlinn.com" className="hover:text-primary transition-colors">Report an Issue</a>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Nomis.Life. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
