import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChordBlock from "../../src/components/blocks/ChordBlock";
import PianoRollBlock from "../../src/components/blocks/PianoRollBlock";
import TextBlock from "../../src/components/blocks/TextBlock";
import { useStore } from "../../src/store/useStore";
import { Block, BlockData } from "../../src/types";

export default function MemoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { memos, updateMemoTitle, addBlock, updateBlock, deleteBlock } = useStore();
  const memo = memos.find((m) => m.id === id);

  useLayoutEffect(() => {
    if (memo) {
      navigation.setOptions({ title: memo.title || "無題" });
    }
  }, [memo?.title]);

  if (!memo) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#e0e0ff" }}>メモが見つかりません</Text>
      </View>
    );
  }

  const handleAddBlock = (type: "piano_roll" | "chord") => {
    const data: BlockData =
      type === "piano_roll"
        ? { type: "piano_roll", notes: [], bpm: 120 }
        : { type: "chord", root: "C", chordType: "major" };
    addBlock(memo.id, data);
  };

  const renderBlock = (block: Block) => {
    const { id: blockId, data } = block;
    if (data.type === "text") {
      return (
        <TextBlock
          key={blockId}
          data={data}
          onChange={(d) => updateBlock(memo.id, blockId, d)}
          onDelete={() => deleteBlock(memo.id, blockId)}
        />
      );
    }
    if (data.type === "piano_roll") {
      return (
        <PianoRollBlock
          key={blockId}
          data={data}
          onChange={(d) => updateBlock(memo.id, blockId, d)}
          onDelete={() => deleteBlock(memo.id, blockId)}
        />
      );
    }
    if (data.type === "chord") {
      return (
        <ChordBlock
          key={blockId}
          data={data}
          onChange={(d) => updateBlock(memo.id, blockId, d)}
          onDelete={() => deleteBlock(memo.id, blockId)}
        />
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          value={memo.title}
          onChangeText={(t) => updateMemoTitle(memo.id, t)}
          placeholder="タイトル..."
          placeholderTextColor="#555"
        />
        {memo.blocks.map(renderBlock)}
        <BlockAddRow onAdd={handleAddBlock} />
      </ScrollView>
    </View>
  );
}

function BlockAddRow({ onAdd }: { onAdd: (type: "piano_roll" | "chord") => void }) {
  return (
    <View style={styles.addRow}>
      <TouchableOpacity onPress={() => onAdd("piano_roll")} style={styles.addBtn}>
        <Text style={styles.addBtnIcon}>♪</Text>
        <Text style={styles.addBtnLabel}>譜面を追加</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onAdd("chord")} style={styles.addBtn}>
        <Text style={styles.addBtnIcon}>♬</Text>
        <Text style={styles.addBtnLabel}>コードを追加</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  scroll: { padding: 14, paddingBottom: 80 },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e0e0ff",
    marginBottom: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a5e",
  },
  addRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
    padding: 12,
    backgroundColor: "#2a2a4e",
    borderRadius: 12,
  },
  addBtn: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#3a3a5e",
    minWidth: 72,
  },
  addBtnIcon: { fontSize: 22, color: "#9988cc" },
  addBtnLabel: { fontSize: 11, color: "#aaa", marginTop: 4 },
});
