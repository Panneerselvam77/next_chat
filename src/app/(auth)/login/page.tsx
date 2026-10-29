"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, MessageCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { login, clearAuthError } from "@/features/auth/auth.slice";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    dispatch(clearAuthError());

    try {
      await dispatch(login({ username, password })).unwrap();

      router.replace("/feed");
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
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              Sign in to catch up with your community.
            </CardDescription>
          </div>
          <CardAction>
            <Link
              href="/register"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign up
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent className="gap-0 px-7 pb-8 pt-6 sm:px-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="Your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            Need a practice account?{" "}
            <Link
              href="https://dummyjson.com/docs/auth"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            >
              View test credentials
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
