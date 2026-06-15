"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Mascot from "@/components/mascot/Mascot";
import { buttonClasses } from "@/components/ui/Button";
import { STATUS_META, useOrders } from "@/context/OrdersContext";
import { useCart } from "@/context/CartContext";
import { useMenu } from "@/context/MenuContext";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";

export default function OrdersPage() {
  const router = useRouter();
  const { orders: allOrders, removeOrder } = useOrders();
  const { replaceItems } = useCart();
  const { getDish } = useMenu();
  const { profile } = useChildProfile();
  const { t } = useLanguage();

  // Siblings can share this device, so only show orders placed under the
  // currently active profile's name.
  const orders = profile
    ? allOrders.filter((o) => o.childName.trim().toLowerCase() === profile.name.trim().toLowerCase())
    : [];

  function handleEditOrder(orderId: string) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    if (!window.confirm(t("orders.editConfirm"))) return;

    replaceItems(
      order.items.map((item) => {
        const dish = getDish(item.dishId);
        return {
          dishId: item.dishId,
          name: item.name,
          emoji: item.emoji,
          image: dish?.image ?? "",
          portion: item.portion,
          quantity: item.quantity,
          coinValue: item.coinValue,
          isSnack: item.isSnack,
        };
      })
    );
    removeOrder(order.id);
    router.push("/cart");
  }

  if (orders.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <Mascot mascotId={profile?.mascotId} emotion="thinking" message={t("orders.noOrdersMascot")} size="lg" />
        <h1 className="font-heading text-3xl font-extrabold text-eel">{t("orders.title")}</h1>
        <p className="max-w-sm text-eel-light">{t("orders.noOrdersText")}</p>
        <Link href="/menu" className={buttonClasses({ color: "macaw" })}>
          {t("orders.browseMenu")}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 pb-28">
      <h1 className="mb-6 text-center font-heading text-4xl font-extrabold text-feather">
        {t("orders.title")}
      </h1>

      <div className="mx-auto flex max-w-xl flex-col gap-4">
        {orders.map((order, index) => {
          const status = STATUS_META[order.status];
          const placedAt = new Date(order.createdAt);

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-3xl bg-white p-5 shadow-card"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-heading text-sm font-bold text-eel-light">
                  {placedAt.toLocaleDateString()} · {placedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${status.colorClass}`}>
                  {status.emoji} {t(`status.${order.status}`)}
                </span>
              </div>

              <ul className="mb-4 flex flex-col gap-1">
                {order.items.map((item) => (
                  <li
                    key={`${order.id}-${item.dishId}-${item.portion}`}
                    className="flex items-center justify-between text-eel"
                  >
                    <span>
                      {item.emoji} {item.name}{" "}
                      <span className="text-eel-light">({t(`menu.${item.portion}`)})</span>
                    </span>
                    <span className="font-heading font-extrabold">x{item.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-3 flex items-center gap-3 rounded-2xl bg-cloud p-3">
                <Mascot
                  mascotId={profile?.mascotId}
                  emotion={index === 0 ? "cheering" : "happy"}
                  message={null}
                  size="sm"
                  className="shrink-0"
                />
                <p className="font-heading text-sm font-bold text-eel">{order.mascotMessage}</p>
              </div>

              {order.status === "preparing" && (
                <button
                  type="button"
                  onClick={() => handleEditOrder(order.id)}
                  className="btn-press w-full rounded-2xl bg-cloud px-4 py-2 text-sm font-heading font-extrabold text-eel shadow-duo-sm shadow-wolf"
                >
                  {t("orders.editOrder")}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
