"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useOrders } from "@/context/OrdersContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { getSavedProfiles } from "@/lib/childProfile";

interface ScheduleRow {
  profile_name: string;
  times: string[];
  enabled: boolean;
}

interface ChildEntry {
  /** Display name (original casing). */
  name: string;
  /** Lowercased/trimmed — matches `profile_name` in the schedules table. */
  key: string;
}

type SendState = "idle" | "sending" | "sent" | "empty" | "error";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { orders } = useOrders();
  const parentPush = usePushSubscription("parent");

  const [schedules, setSchedules] = useState<Record<string, ScheduleRow>>({});
  const [loaded, setLoaded] = useState(false);
  const [sendState, setSendState] = useState<Record<string, SendState>>({});
  const [saveState, setSaveState] = useState<Record<string, "idle" | "saving" | "saved">>({});

  // Children = anyone who has placed an order, plus any profiles saved on
  // this device (covers a child who set up but hasn't ordered yet).
  const children = useMemo<ChildEntry[]>(() => {
    const map = new Map<string, string>();
    for (const order of orders) {
      const key = order.childName.trim().toLowerCase();
      if (key && !map.has(key)) map.set(key, order.childName);
    }
    for (const profile of getSavedProfiles()) {
      const key = profile.name.trim().toLowerCase();
      if (key && !map.has(key)) map.set(key, profile.name);
    }
    return Array.from(map.entries())
      .map(([key, name]) => ({ key, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [orders]);

  useEffect(() => {
    fetch("/api/push/schedules")
      .then((res) => res.json())
      .then((data: { schedules?: ScheduleRow[] }) => {
        const map: Record<string, ScheduleRow> = {};
        for (const row of data.schedules ?? []) {
          map[row.profile_name] = row;
        }
        setSchedules(map);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function getSchedule(key: string): ScheduleRow {
    return schedules[key] ?? { profile_name: key, times: [], enabled: true };
  }

  function updateSchedule(key: string, update: Partial<ScheduleRow>) {
    setSchedules((prev) => ({
      ...prev,
      [key]: { ...getSchedule(key), ...update },
    }));
    setSaveState((prev) => ({ ...prev, [key]: "idle" }));
  }

  function addTime(key: string) {
    const current = getSchedule(key);
    updateSchedule(key, { times: [...current.times, "09:00"] });
  }

  function removeTime(key: string, index: number) {
    const current = getSchedule(key);
    updateSchedule(key, { times: current.times.filter((_, i) => i !== index) });
  }

  function setTime(key: string, index: number, value: string) {
    const current = getSchedule(key);
    const times = [...current.times];
    times[index] = value;
    updateSchedule(key, { times });
  }

  async function saveSchedule(entry: ChildEntry) {
    const schedule = getSchedule(entry.key);
    setSaveState((prev) => ({ ...prev, [entry.key]: "saving" }));
    try {
      const res = await fetch("/api/push/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: entry.name,
          times: schedule.times.filter(Boolean),
          enabled: schedule.enabled,
        }),
      });
      setSaveState((prev) => ({ ...prev, [entry.key]: res.ok ? "saved" : "idle" }));
      if (res.ok) {
        setTimeout(() => setSaveState((prev) => ({ ...prev, [entry.key]: "idle" })), 2000);
      }
    } catch {
      setSaveState((prev) => ({ ...prev, [entry.key]: "idle" }));
    }
  }

  async function sendNow(entry: ChildEntry) {
    setSendState((prev) => ({ ...prev, [entry.key]: "sending" }));
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "child", profileName: entry.name, kind: "reminder" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendState((prev) => ({ ...prev, [entry.key]: "error" }));
      } else if (!data.sent) {
        setSendState((prev) => ({ ...prev, [entry.key]: "empty" }));
      } else {
        setSendState((prev) => ({ ...prev, [entry.key]: "sent" }));
      }
    } catch {
      setSendState((prev) => ({ ...prev, [entry.key]: "error" }));
    }
    setTimeout(() => setSendState((prev) => ({ ...prev, [entry.key]: "idle" })), 3000);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-1 font-heading text-3xl font-extrabold text-eel">{t("notifications.admin.title")}</h1>
      <p className="mb-6 text-eel-light">{t("notifications.admin.intro")}</p>

      {/* Parent's own "order placed" notifications */}
      <div className="mb-6 rounded-3xl bg-white p-5 shadow-card">
        <p className="font-heading text-lg font-extrabold text-eel">
          {t("notifications.admin.parentSection.title")}
        </p>
        <p className="mt-1 text-sm text-eel-light">{t("notifications.admin.parentSection.body")}</p>
        <div className="mt-3">
          {parentPush.status === "subscribed" ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-feather-50 px-3 py-1 text-sm font-extrabold text-feather-700">
                ✅ {t("notifications.admin.parentSection.enabled")}
              </span>
              <button
                type="button"
                onClick={() => parentPush.disable()}
                disabled={parentPush.busy}
                className="rounded-full bg-cloud px-4 py-2 text-sm font-heading font-bold text-eel-light hover:text-cardinal disabled:opacity-60"
              >
                {t("notifications.admin.parentSection.disable")}
              </button>
            </div>
          ) : parentPush.status === "denied" ? (
            <p className="text-sm font-bold text-cardinal">{t("notifications.enable.deniedHint")}</p>
          ) : (
            <button
              type="button"
              onClick={() => parentPush.enable()}
              disabled={parentPush.busy || parentPush.status === "unsupported"}
              className="rounded-full bg-feather px-4 py-2 text-sm font-heading font-extrabold text-white disabled:opacity-60"
            >
              {t("notifications.admin.parentSection.enable")}
            </button>
          )}
        </div>
      </div>

      {/* Per-child reminders */}
      {loaded && children.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-card">
          <span className="text-5xl">🔔</span>
          <p className="mt-3 font-heading font-bold text-eel-light">{t("notifications.admin.noChildren")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {children.map((entry) => {
            const schedule = getSchedule(entry.key);
            const send = sendState[entry.key] ?? "idle";
            const save = saveState[entry.key] ?? "idle";

            return (
              <motion.div
                key={entry.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white p-5 shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-heading text-lg font-extrabold text-eel">👤 {entry.name}</p>

                  <div className="flex items-center gap-2">
                    {send === "sent" && (
                      <span className="text-sm font-bold text-feather-700">
                        {t("notifications.admin.sendNowSuccess")}
                      </span>
                    )}
                    {send === "empty" && (
                      <span className="text-sm font-bold text-cardinal">
                        {t("notifications.admin.sendNowNoSubscription", { name: entry.name })}
                      </span>
                    )}
                    {send === "error" && (
                      <span className="text-sm font-bold text-cardinal">
                        {t("notifications.admin.sendNowError")}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => sendNow(entry)}
                      disabled={send === "sending"}
                      className="rounded-full bg-macaw px-4 py-2 text-sm font-heading font-extrabold text-white disabled:opacity-60"
                    >
                      🔔 {t("notifications.admin.sendNow")}
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-cloud pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-heading text-sm font-extrabold text-eel">
                      {t("notifications.admin.scheduleTitle")}
                    </p>
                    <label className="flex items-center gap-2 text-sm font-bold text-eel-light">
                      <input
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={(e) => updateSchedule(entry.key, { enabled: e.target.checked })}
                        className="h-4 w-4 accent-feather"
                      />
                      {schedule.enabled
                        ? t("notifications.admin.scheduleEnabled")
                        : t("notifications.admin.scheduleDisabled")}
                    </label>
                  </div>

                  {schedule.times.length === 0 ? (
                    <p className="mt-2 text-sm text-eel-light">{t("notifications.admin.noTimes")}</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {schedule.times.map((time, index) => (
                        <div key={index} className="flex items-center gap-1 rounded-full bg-cloud px-2 py-1">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(entry.key, index, e.target.value)}
                            className="rounded-full bg-white px-2 py-1 text-sm font-bold text-eel"
                          />
                          <button
                            type="button"
                            onClick={() => removeTime(entry.key, index)}
                            aria-label={t("notifications.admin.removeTime", { time })}
                            className="px-1 text-eel-light hover:text-cardinal"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => addTime(entry.key)}
                      className="rounded-full bg-cloud px-4 py-2 text-sm font-heading font-bold text-eel hover:bg-bee-50"
                    >
                      {t("notifications.admin.addTime")}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveSchedule(entry)}
                      disabled={save === "saving"}
                      className="rounded-full bg-feather px-4 py-2 text-sm font-heading font-extrabold text-white disabled:opacity-60"
                    >
                      {save === "saved" ? t("notifications.admin.saved") : t("notifications.admin.save")}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
