
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAppwriteUser } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getAppwriteUser();
      if (!user) {
        router.replace('/signin');
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null;
}
