"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Mascot from "@/components/mascot/Mascot";
import CartItemThumb from "@/components/cart/CartItemThumb";
import Button, { buttonClasses } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";
import { generateMotivationalMessage } from "@/lib/motivation";

export default function CartPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { items, removeItem, clearCart, totalCount } = useCart();
  const { addOrder } = useOrders();
  const { profile } = useChildProfile();

  const [motivation, setMotivation] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  // Generate the "AI" mascot message on the client only, so it can use
  // randomness without causing a server/client markup mismatch.
  useEffect(() => {
    if (items.length === 0) {
      setMotivation(null);
      return;
    }
    setMotivation(generateMotivationalMessage(items, profile?.name, lang));
  }, [items, profile?.name, lang]);

  function handlePlaceOrder() {
    if (items.length === 0 || placing) return;
    setPlacing(true);
    addOrder(
      items,
      motivation ?? generateMotivationalMessage(items, profile?.name, lang),
      profile?.name ?? "Friend"
    );
    clearCart();
    router.push("/orders");
  }

  if (totalCount === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <Mascot mascotId={profile?.mascotId} emotion="thinking" message={t("cart.empty")} size="lg" />
        <h1 className="font-heading text-3xl font-extrabold text-eel">{t("cart.title")}</h1>
        <Link href="/menu" className={buttonClasses({ color: "macaw" })}>
          {t("cart.browseMenu")}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 pb-32">
      <h1 className="mb-6 text-center font-heading text-4xl font-extrabold text-feather">
        {t("cart.title")}
      </h1>

      <div className="mx-auto flex max-w-xl flex-col gap-3">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={`${item.dishId}-${item.portion}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card"
            >
              <CartItemThumb image={item.image} emoji={item.emoji} alt={item.name} />
              <div className="flex-1">
                <p className="font-heading font-extrabold text-eel">{item.name}</p>
                <p className="text-sm text-eel-light">
                  {t(`menu.${item.portion}`)} {t("cart.portion")} · x{item.quantity}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.dishId, item.portion)}
                className="btn-press rounded-full bg-cloud px-3 py-2 text-sm font-extrabold text-cardinal shadow-duo-sm shadow-wolf"
              >
                {t("cart.remove")}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Order summary + AI motivational message */}
      <div className="mx-auto mt-8 max-w-xl rounded-3xl bg-white p-5 shadow-card">
        <h2 className="mb-3 font-heading text-xl font-extrabold text-eel">{t("cart.summary")}</h2>

        <div className="mb-4 flex items-center justify-between text-eel-light">
          <span>{t("cart.totalItems")}</span>
          <span className="font-heading text-lg font-extrabold text-eel">{totalCount}</span>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-cloud p-4">
          <Mascot
            mascotId={profile?.mascotId}
            emotion="excited"
            message={null}
            size="sm"
            className="shrink-0"
          />
          <AnimatePresence mode="wait">
            {motivation && (
              <motion.p
                key={motivation}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="font-heading text-sm font-bold text-eel"
              >
                {motivation}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-xl">
        <Button onClick={handlePlaceOrder} disabled={placing} color="feather" className="w-full">
          {placing ? t("cart.placingOrder") : t("cart.placeOrder")}
        </Button>
      </div>
    </main>
  );
}
