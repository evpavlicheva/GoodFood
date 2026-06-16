"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface CustomCategory {
  id: string;
  name: string;
  nameRu: string;
  emoji: string;
}

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase
      .from("custom_categories")
      .select("id, name, name_ru, emoji")
      .order("created_at");
    setCustomCategories(
      (data ?? []).map((r: { id: string; name: string; name_ru: string; emoji: string }) => ({
        id: r.id,
        name: r.name,
        nameRu: r.name_ru,
        emoji: r.emoji,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addCategory(name: string, nameRu: string, emoji: string) {
    if (!supabase) return;
    await supabase.from("custom_categories").insert({ name, name_ru: nameRu, emoji });
    await load();
  }

  async function deleteCategory(id: string) {
    if (!supabase) return;
    await supabase.from("custom_categories").delete().eq("id", id);
    await load();
  }

  return { customCategories, loading, addCategory, deleteCategory, reload: load };
}
