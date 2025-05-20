"use client";

import Link from 'next/link';
import { Gem, UserCircle, LogOut, LogIn, History, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client'; // Changed to getSupabaseBrowserClient
import type { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient(); // Use the getter

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user && (pathname === '/generate' || pathname === '/history' || pathname.startsWith('/edit'))) {
        router.push('/login');
      }
      if (session?.user && (pathname === '/login' || pathname === '/signup')) {
        router.push('/generate');
      }
    });

    return () => {
      // Ensure subscription exists before trying to unsubscribe
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase, pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); 
    router.refresh(); // to ensure server components update
  };

  const navItems = [
    { href: '/generate', label: 'Generate', icon: Wand2 },
    { href: '/history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-lg font-bold text-primary">
          <Gem className="h-7 w-7" />
          <span className="font-bold">Renderri</span>
        </Link>
        
        {user && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-colors hover:text-primary ${
                  pathname === item.href ? 'text-primary' : 'text-foreground/60'
                }`}
              >
                <item.icon className="inline-block h-5 w-5 mr-1 mb-0.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <AvatarUser user={user} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


function AvatarUser({ user }: { user: User }) {
  const initials = user.email?.[0].toUpperCase() || '?';
  return (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
      {initials}
    </div>
  );
}

