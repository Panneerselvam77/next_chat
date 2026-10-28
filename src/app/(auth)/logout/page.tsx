"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "@/features/auth/auth.slice";
import { useAppDispatch } from "@/hooks/hooks";
import { Button } from "@/components/ui/button";

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p role={error ? "alert" : "status"} className="text-sm text-muted-foreground">
        {error ?? "Logging out..."}
      </p>
      {error && (
        <Button type="button" onClick={handleLogout} disabled={isLoading}>
          Try again
        </Button>
      )}
    </main>
  );
}