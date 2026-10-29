"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, LogOut } from "lucide-react";

import { logout } from "@/features/auth/auth.slice";
import { useAppDispatch } from "@/hooks/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LogoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await dispatch(logout()).unwrap();
      router.replace("/login");
      router.refresh();
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : "Unable to log out. Please try again.",
      );
      setIsLoading(false);
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void handleLogout();
  }, [handleLogout]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm items-center border-border/70 text-center shadow-sm">
        <CardHeader className="items-center px-7 pt-8">
          <div
            className={`flex size-12 items-center justify-center rounded-2xl ${
              error
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            {error ? (
              <AlertCircle aria-hidden="true" className="size-6" />
            ) : (
              <LogOut aria-hidden="true" className="size-6" />
            )}
          </div>
          <CardTitle>{error ? "Unable to log out" : "Signing you out"}</CardTitle>
          <CardDescription role={error ? "alert" : "status"}>
            {error ?? "Your session is being securely closed."}
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent className="px-7 pb-8">
            <Button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Trying again...
                </>
              ) : (
                "Try again"
              )}
            </Button>
          </CardContent>
        )}
      </Card>
    </main>
  );
}