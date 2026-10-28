"use client";

import { useState } from "react";
import { Provider } from "react-redux";

import { AuthInitializer } from "@/features/auth/AuthInitializer";
import { makeStore } from "@/store/store";
import type { AppStore } from "@/store/store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(makeStore);

  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  );
}
