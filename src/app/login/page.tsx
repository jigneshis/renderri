"use client"; // Make it a client component to use useSearchParams

import AuthForm from "@/components/auth/AuthForm";
import { login } from "@/actions/authActions";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { Gem } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'check_email') {
      toast({
        title: "Check Your Email",
        description: "A confirmation link has been sent to your email address.",
        duration: 5000,
      });
      // Remove the message from URL to prevent re-toasting on refresh
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router, toast]);
  
  return (
    <>
    <Header />
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <Gem className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back to Renderri</h1>
          <p className="text-muted-foreground">
            Sign in to continue your creative journey.
          </p>
        </div>
        <AuthForm mode="login" onSubmitAction={login} />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button variant="link" className="p-0 h-auto text-primary" asChild>
            <Link href="/signup">
              Sign up
            </Link>
          </Button>
        </p>
      </div>
    </div>
    </>
  );
}
