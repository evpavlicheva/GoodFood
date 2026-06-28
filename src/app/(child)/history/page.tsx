"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Mascot from "@/components/mascot/Mascot";
import { buttonClasses } from "@/components/ui/Button";
import { STATUS_META, useOrders } from "@/context/OrdersContext";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";

export default function HistoryPage() {
  const { orders: allOrders } = useOrders();
  const { profile } = useChildProfile();
  const { t } = useLanguage();

  const orders = profile
    ? allOrders.filter(
        (o) =>
          o.childName.trim().toLowerCase() === profile.name.trim().toLowerCase() &&
          (o.status === "completed" || o.status === "cancelled")
      )
    : [];

  if (orders.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <Mascot mascotId={profile?.mascotId} emotion="thinking" message={t("history.text")} size="lg" />
        <h1 className="font-heading text-3xl font-extrabold text-eel">{t("history.title")}</h1>
        <p className="max-w-sm text-eel-light">{t("history.text")}</p>
        <Link href="/menu" className={buttonClasses({ color: "macaw" })}>
          {t("orders.browseMenu")}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 pb-28">
      <h1 className="mb-6 text-center font-heading text-4xl font-extrabold text-feather">
        {t("history.title")}
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
              className="rounded-3xl bg-white p-5 shadow-card opacity-90"
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

              <div className="flex items-center gap-3 rounded-2xl bg-cloud p-3">
                <Mascot
                  mascotId={profile?.mascotId}
                  emotion="happy"
                  message={null}
                  size="sm"
                  className="shrink-0"
                />
                <p className="font-heading text-sm font-bold text-eel">{order.mascotMessage}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
