import AsyncStorage from "@react-native-async-storage/async-storage";
import { Memo } from "../types";

const MEMOS_KEY = "note_a_note_memos";

export async function loadMemos(): Promise<Memo[]> {
  try {
    const json = await AsyncStorage.getItem(MEMOS_KEY);
    if (!json) return [];
    return JSON.parse(json) as Memo[];
  } catch {
    return [];
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function saveMemos(memos: Memo[]): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    AsyncStorage.setItem(MEMOS_KEY, JSON.stringify(memos)).catch(console.error);
  }, 400);
}
