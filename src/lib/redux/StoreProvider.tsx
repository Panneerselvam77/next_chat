"use client";
import { makeStore } from "@/store/store";
import type { AppStore } from "@/store/store";
import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";

export default function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [store] = useState<AppStore>(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
