"use client";

import { motion } from "framer-motion";
import { useOrders, STATUS_META, type OrderStatus } from "@/context/OrdersContext";
import { useLanguage } from "@/context/LanguageContext";
import { pluralRu } from "@/lib/i18n/translations";

const STATUS_FLOW: OrderStatus[] = ["preparing", "ready", "completed"];

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const { orders, updateOrderStatus, removeOrder } = useOrders();
  const { t, lang } = useLanguage();

  function handleDelete(orderId: string) {
    if (!window.confirm(t("admin.dashboard.deleteConfirm"))) return;
    removeOrder(orderId);
  }

  const ordersWord =
    lang === "ru"
      ? pluralRu(orders.length, "заказ", "заказа", "заказов")
      : `order${orders.length === 1 ? "" : "s"}`;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-1 font-heading text-3xl font-extrabold text-eel">{t("admin.dashboard.title")}</h1>
      <p className="mb-6 text-eel-light">
        {orders.length === 0
          ? t("admin.dashboard.emptyText")
          : t("admin.dashboard.ordersSoFar", { count: `${orders.length} ${ordersWord}` })}
      </p>

      {orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-card">
          <span className="text-5xl">🍽️</span>
          <p className="mt-3 font-heading font-bold text-eel-light">{t("admin.dashboard.emptyHeading")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const meta = STATUS_META[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg font-extrabold text-eel">
                      👤 {order.childName}
                    </p>
                    <p className="text-sm text-eel-light">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${meta.colorClass}`}>
                    {meta.emoji} {t(`status.${order.status}`)}
                  </span>
                </div>

                <ul className="mt-4 flex flex-col gap-1">
                  {order.items.map((item, i) => (
                    <li key={`${item.dishId}-${i}`} className="flex items-center gap-2 text-eel">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="font-bold">{item.name}</span>
                      <span className="text-sm text-eel-light">
                        ({t(`menu.${item.portion}`)}) x{item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 rounded-2xl bg-cloud p-3 text-sm text-eel-light">
                  💬 &ldquo;{order.mascotMessage}&rdquo;
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUS_FLOW.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateOrderStatus(order.id, status)}
                      className={`btn-press rounded-xl px-3 py-2 text-sm font-heading font-bold transition-colors ${
                        order.status === status
                          ? "bg-feather text-white shadow-duo-sm shadow-feather-700"
                          : "bg-cloud text-eel-light hover:text-eel"
                      }`}
                    >
                      {STATUS_META[status].emoji} {t(`status.${status}`)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                    className={`btn-press rounded-xl px-3 py-2 text-sm font-heading font-bold transition-colors ${
                      order.status === "cancelled"
                        ? "bg-cardinal text-white shadow-duo-sm shadow-cardinal-700"
                        : "bg-cloud text-eel-light hover:text-cardinal"
                    }`}
                  >
                    ❌ {t("admin.dashboard.cancel")}
                  </button>
                  {order.status === "cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      className="btn-press rounded-xl bg-cardinal-50 px-3 py-2 text-sm font-heading font-bold text-cardinal transition-colors hover:bg-cardinal hover:text-white"
                    >
                      🗑️ {t("admin.dashboard.delete")}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
