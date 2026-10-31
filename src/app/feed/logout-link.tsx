"use client";

import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { logout } from "@/features/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Button } from "@/components/ui/button";

export default function LogoutLink({ compact = false }: { compact?: boolean }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  async function handleLogout() {
    try {
      await dispatch(logout()).unwrap();
      router.replace("/login");
      router.refresh();
    } catch {
      // The rejected thunk updates auth.error in Redux.
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant={compact ? "ghost" : "outline"}
        size={compact ? "icon" : "sm"}
        onClick={handleLogout}
        disabled={isLoading}
        aria-label={compact ? (isLoading ? "Signing out" : "Sign out") : undefined}
        title={compact ? "Sign out" : undefined}
      >
        {isLoading ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            {!compact && "Signing out"}
          </>
        ) : (
          <>
            <LogOut aria-hidden="true" />
            {!compact && "Sign out"}
          </>
        )}
      </Button>
      {error && !compact && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {error && compact && (
        <p role="alert" className="sr-only">
          {error}
        </p>
      )}
    </div>
  );
}
