/**
 * Minimal ambient type declarations for the `web-push` package.
 *
 * The published `web-push` npm package ships only JS (no `.d.ts`), and we
 * don't depend on `@types/web-push`. This declares just the API surface used
 * in `src/lib/push/server.ts` so the production build's type check passes.
 */
declare module "web-push" {
  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  export interface RequestOptions {
    headers?: Record<string, string>;
    gcmAPIKey?: string;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
    TTL?: number;
    contentEncoding?: string;
    proxy?: string;
    agent?: unknown;
    timeout?: number;
  }

  export interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  export class WebPushError extends Error {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    endpoint: string;
    constructor(
      message: string,
      statusCode: number,
      headers: Record<string, string>,
      body: string,
      endpoint: string
    );
  }

  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: RequestOptions
  ): Promise<SendResult>;

  export function generateVAPIDKeys(): { publicKey: string; privateKey: string };

  const webpush: {
    setVapidDetails: typeof setVapidDetails;
    sendNotification: typeof sendNotification;
    generateVAPIDKeys: typeof generateVAPIDKeys;
  };

  export default webpush;
}
