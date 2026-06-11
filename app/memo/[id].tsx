import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect } from "react";
import {
  InputAccessoryView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChordBlock from "../../src/components/blocks/ChordBlock";
import PianoRollBlock from "../../src/components/blocks/PianoRollBlock";
import { useStore } from "../../src/store/useStore";
import { Block, BlockData } from "../../src/types";

const KEYBOARD_TOOLBAR_ID = "memo-keyboard-toolbar";

export default function MemoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { memos, updateMemoTitle, updateMemoContent, addBlock, updateBlock, deleteBlock } = useStore();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          value={memo.title}
          onChangeText={(t) => updateMemoTitle(memo.id, t)}
          placeholder="タイトル..."
          placeholderTextColor="#555"
          // タイトル欄はツールバー不要なので inputAccessoryViewID を付けない
        />
        <TextInput
          style={styles.contentInput}
          value={memo.content}
          onChangeText={(t) => updateMemoContent(memo.id, t)}
          placeholder="メモを入力..."
          placeholderTextColor="#555"
          multiline
          textAlignVertical="top"
          inputAccessoryViewID={KEYBOARD_TOOLBAR_ID}
        />
        {memo.blocks.map(renderBlock)}
      </ScrollView>

      {/* iOS: キーボード上部ツールバー */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={KEYBOARD_TOOLBAR_ID}>
          <KeyboardToolbar onAdd={handleAddBlock} />
        </InputAccessoryView>
      )}

      {/* Android: 画面下部に固定ツールバー（キーボード非表示時も表示） */}
      {Platform.OS === "android" && (
        <KeyboardToolbar onAdd={handleAddBlock} />
      )}
    </KeyboardAvoidingView>
  );
}

function KeyboardToolbar({ onAdd }: { onAdd: (type: "piano_roll" | "chord") => void }) {
  return (
    <View style={styles.toolbar}>
      <TouchableOpacity onPress={() => onAdd("piano_roll")} style={styles.toolbarBtn}>
        <Text style={styles.toolbarBtnIcon}>♪</Text>
        <Text style={styles.toolbarBtnLabel}>譜面</Text>
      </TouchableOpacity>
      <View style={styles.toolbarDivider} />
      <TouchableOpacity onPress={() => onAdd("chord")} style={styles.toolbarBtn}>
        <Text style={styles.toolbarBtnIcon}>♬</Text>
        <Text style={styles.toolbarBtnLabel}>コード</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  scroll: { padding: 14, paddingBottom: 40 },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e0e0ff",
    marginBottom: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a5e",
  },
  contentInput: {
    fontSize: 15,
    color: "#e0e0ff",
    lineHeight: 24,
    minHeight: 160,
    paddingVertical: 8,
    marginBottom: 12,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a4e",
    borderTopWidth: 1,
    borderTopColor: "#3a3a5e",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  toolbarBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  toolbarBtnIcon: { fontSize: 20, color: "#9988cc" },
  toolbarBtnLabel: { fontSize: 14, color: "#c0b0ff" },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#3a3a5e",
    marginHorizontal: 4,
  },
});
