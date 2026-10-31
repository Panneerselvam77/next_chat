"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, MessageCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { register, clearAuthError } from "@/features/auth/auth.slice";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardAction,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    dispatch(clearAuthError());

    try {
      await dispatch(register(user)).unwrap();
      router.replace("/login");
    } catch {
      // The rejected thunk updates auth.error in Redux.
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-primary/10 blur-3xl"
      />

      <Card className="relative w-full max-w-md gap-0 border-0 shadow-xl shadow-primary/5 ring-1 ring-border/70">
        <CardHeader className="space-y-5 px-7 pt-8 text-center sm:px-9">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <MessageCircle aria-hidden="true" className="size-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Join the conversation
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              Create an account to find and share what matters.
            </CardDescription>
          </div>
          <CardAction>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign in
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent className="gap-0 px-7 pb-8 pt-6 sm:px-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Choose a username"
                value={user.username}
                onChange={handleUserInput}
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9_]+"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={user.email}
                onChange={handleUserInput}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={user.password}
                onChange={handleUserInput}
                minLength={8}
                maxLength={128}
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            By continuing, you agree to be kind and respectful to the community.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
