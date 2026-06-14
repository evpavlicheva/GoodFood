"use client";

import { useState } from "react";
import Mascot from "@/components/mascot/Mascot";
import { MASCOTS, type MascotEmotion, type MascotId } from "@/components/mascot/mascotData";

const EMOTIONS: MascotEmotion[] = [
  "idle",
  "happy",
  "excited",
  "surprised",
  "thinking",
  "cheering",
];

export default function MascotDemoPage() {
  const [mascotId, setMascotId] = useState<MascotId>("broccoli");
  const [emotion, setEmotion] = useState<MascotEmotion>("idle");

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 p-8">
      <h1 className="font-heading text-4xl font-extrabold text-feather">
        Mascot Playground
      </h1>

      <Mascot mascotId={mascotId} emotion={emotion} size="xl" />

      <div className="flex flex-col items-center gap-3">
        <p className="font-heading font-bold text-eel-light">Mascot</p>
        <div className="flex flex-wrap justify-center gap-2">
          {MASCOTS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMascotId(m.id)}
              className={`btn-press rounded-2xl px-4 py-2 font-heading font-bold shadow-duo-sm ${
                mascotId === m.id
                  ? "bg-feather text-white shadow-feather-700"
                  : "bg-white text-eel shadow-wolf"
              }`}
            >
              {m.emoji} {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="font-heading font-bold text-eel-light">Emotion</p>
        <div className="flex flex-wrap justify-center gap-2">
          {EMOTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmotion(e)}
              className={`btn-press rounded-2xl px-4 py-2 font-heading font-bold capitalize shadow-duo-sm ${
                emotion === e
                  ? "bg-macaw text-white shadow-macaw-700"
                  : "bg-white text-eel shadow-wolf"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
