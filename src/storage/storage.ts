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

export async function saveMemos(memos: Memo[]): Promise<void> {
  await AsyncStorage.setItem(MEMOS_KEY, JSON.stringify(memos));
}
