import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../src/store/useStore";
import { Memo } from "../src/types";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export default function MemoListScreen() {
  const router = useRouter();
  const { memos, createMemo, deleteMemo } = useStore();
  const [query, setQuery] = useState("");

  const filtered = memos.filter((m) => {
    if (!query) return true;
    const q = query.toLowerCase();
    if (m.title.toLowerCase().includes(q)) return true;
    return m.blocks.some((b) => {
      if (b.data.type === "text") {
        return b.data.spans.some((s) => s.text.toLowerCase().includes(q));
      }
      return false;
    });
  });

  const handleCreate = () => {
    const memo = createMemo();
    router.push(`/memo/${memo.id}`);
  };

  const handleDelete = (memo: Memo) => {
    Alert.alert("削除", `「${memo.title || "無題"}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => deleteMemo(memo.id) },
    ]);
  };

  const renderItem = ({ item }: { item: Memo }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/memo/${item.id}`)}
      onLongPress={() => handleDelete(item)}
    >
      <Text style={styles.itemTitle} numberOfLines={1}>
        {item.title || "無題"}
      </Text>
      <Text style={styles.itemDate}>{formatDate(item.updatedAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="メモを検索..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query ? "一致するメモがありません" : "メモがありません\n右下の＋から作成できます"}
          </Text>
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : undefined}
      />
      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  search: {
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#2a2a4e",
    borderRadius: 10,
    color: "#e0e0ff",
    fontSize: 15,
  },
  item: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 14,
    backgroundColor: "#2a2a4e",
    borderRadius: 10,
  },
  itemTitle: { color: "#e0e0ff", fontSize: 16, fontWeight: "600" },
  itemDate: { color: "#8888aa", fontSize: 12, marginTop: 4 },
  empty: { color: "#8888aa", textAlign: "center", fontSize: 15, lineHeight: 24 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6655ee",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 32 },
});
