"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setStatus("Completing authentication...");

        // The OAuth callback automatically creates the session
        // We just need to verify it worked
        const user = await account.get();

        if (user) {
          setStatus("Authentication successful! Redirecting...");
          // Small delay to show success message
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } catch (error) {
        console.error("OAuth callback failed:", error);
        setStatus("Authentication failed. Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login?error=oauth_failed");
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>{status}</p>
      </div>
    </div>
  );
}
