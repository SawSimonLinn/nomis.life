
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-background">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="items-center">
          <div>
             <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={80}
                data-ai-hint="logo"
             />
          </div>
          <CardTitle className="text-2xl font-headline font-bold">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-md">
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href="/">Go Back to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
