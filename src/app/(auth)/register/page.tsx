"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { register, clearAuthError } from "@/features/auth/auth.slice";

import { Button } from "@/components/ui/button";
import {
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
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Register to connect with your community.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Enter your username"
                value={user.username}
                onChange={handleUserInput}
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={user.password}
                onChange={handleUserInput}
                required
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
