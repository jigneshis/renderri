"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormProps = {
  mode: "login" | "signup";
  onSubmitAction: (values: z.infer<typeof formSchema>) => Promise<{ error: { message: string } | null; data?: any }>;
};

export default function AuthForm({ mode, onSubmitAction }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { error, data } = await onSubmitAction(values);
    setIsLoading(false);

    if (error) {
      toast({
        title: `Error during ${mode}`,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: mode === "login" ? "Login Successful" : "Signup Successful",
        description: mode === "login" ? "Welcome back!" : (data?.needsConfirmation ? "Please check your email to confirm your account." : "Your account has been created."),
      });
      // Supabase client listener in Header will handle redirect if on /login or /signup
      // For direct navigation after successful action:
      if (mode === 'signup' && data?.needsConfirmation) {
        // Stay on page or redirect to a "check your email" page
        router.push('/login?message=check_email'); // Or a dedicated page
      } else {
        router.push(next || '/generate');
      }
      router.refresh(); 
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "login" ? "Log In" : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
}
