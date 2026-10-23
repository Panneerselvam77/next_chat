"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/hooks";
import { getCurrentUser } from "@/features/auth/auth.slice";

export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return null;
}
