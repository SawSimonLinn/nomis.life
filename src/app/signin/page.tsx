"use client";

import { account } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const handleGitHubLogin = async () => {
  try {
    account.createOAuth2Session(
      "github" as any,
      // `${window.location.origin}/dashboard`,
      `${window.location.origin}/auth/callback`,
      `${window.location.origin}/auth/login`
      // `${window.location.origin}/signin`
    );
  } catch (error) {
    console.error("GitHub login error:", error);
  }
};

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Log in to manage your portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGitHubLogin} className="w-full">
            <Github />
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
