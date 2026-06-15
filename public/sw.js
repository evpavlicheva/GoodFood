// GoodFood service worker — handles Web Push notifications.
//
// Two notification "kinds" are sent from the server (see
// src/app/api/push/send/route.ts):
//   - kind: "reminder"     -> shown to the child: "Time to order!"
//   - kind: "order_placed" -> shown to the parent: "<name> placed an order"
//
// When a notification arrives while the app is open in a tab, we also
// postMessage the same payload to every open client so the page can play
// the jingle / show the full-screen "Пора сделать заказ!" overlay
// immediately (the OS notification itself has no sound on most desktop
// browsers).

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "GoodFood", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "GoodFood";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    tag: payload.tag || "goodfood",
    data: payload,
    requireInteraction: payload.kind === "reminder",
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "goodfood-push", payload });
        }
      }),
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const payload = event.notification.data || {};
  const targetUrl = payload.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: "goodfood-notification-click", payload });
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
