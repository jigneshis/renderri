import AuthForm from "@/components/auth/AuthForm";
import { signup } from "@/actions/authActions";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <>
    <Header />
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 bg-background">
       <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <Gem className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Join Renderri Today</h1>
          <p className="text-muted-foreground">
            Create your account and start generating amazing images.
          </p>
        </div>
        <AuthForm mode="signup" onSubmitAction={signup} />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
           <Button variant="link" className="p-0 h-auto text-primary" asChild>
            <Link href="/login">
              Log in
            </Link>
          </Button>
        </p>
      </div>
    </div>
    </>
  );
}
