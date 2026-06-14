"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { MenuProvider } from "@/context/MenuContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChildProfileProvider } from "@/context/ChildProfileContext";

/**
 * App-wide client providers. Shared by both the child and parent route
 * groups so admin edits / orders / language / child profile are visible
 * everywhere.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ChildProfileProvider>
        <MenuProvider>
          <CartProvider>
            <OrdersProvider>{children}</OrdersProvider>
          </CartProvider>
        </MenuProvider>
      </ChildProfileProvider>
    </LanguageProvider>
  );
}
