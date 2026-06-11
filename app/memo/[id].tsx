import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
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
import { Block, BlockData, ContentFormatting, DEFAULT_FORMATTING, TextAlign, TextStyle, ListType } from "../../src/types";

const KEYBOARD_TOOLBAR_ID = "memo-keyboard-toolbar";

export default function MemoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { memos, updateMemoTitle, updateMemoContent, updateMemoFormatting, addBlock, updateBlock, deleteBlock } = useStore();
  const [showFormatBar, setShowFormatBar] = useState(false);
  const memo = memos.find((m) => m.id === id);

  useLayoutEffect(() => {
    if (memo) navigation.setOptions({ title: memo.title || "無題" });
  }, [memo?.title]);

  if (!memo) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#e0e0ff" }}>メモが見つかりません</Text>
      </View>
    );
  }

  const fmt = memo.formatting ?? DEFAULT_FORMATTING;

  const handleAddBlock = (type: "piano_roll" | "chord") => {
    const data: BlockData =
      type === "piano_roll"
        ? { type: "piano_roll", notes: [], bpm: 120 }
        : { type: "chord", root: "C", chordType: "major" };
    addBlock(memo.id, data);
  };

  const updateFmt = (patch: Partial<ContentFormatting>) => {
    updateMemoFormatting(memo.id, { ...fmt, ...patch });
  };

  const contentStyle = [
    styles.contentInput,
    fmt.style === "title" && styles.fmtTitle,
    fmt.style === "heading" && styles.fmtHeading,
    fmt.bold && styles.fmtBold,
    fmt.underline && styles.fmtUnderline,
    { textAlign: fmt.align } as const,
  ];

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

  const toolbar = (
    <View>
      {showFormatBar && (
        <FormatBar fmt={fmt} onChange={updateFmt} />
      )}
      <KeyboardToolbar
        onAdd={handleAddBlock}
        showFormatBar={showFormatBar}
        onToggleFormat={() => setShowFormatBar((v) => !v)}
      />
    </View>
  );

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
        />
        <TextInput
          style={contentStyle}
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

      {Platform.OS === "ios" ? (
        <InputAccessoryView nativeID={KEYBOARD_TOOLBAR_ID}>
          {toolbar}
        </InputAccessoryView>
      ) : (
        toolbar
      )}
    </KeyboardAvoidingView>
  );
}

// ── フォーマットバー ──────────────────────────────────
function FormatBar({ fmt, onChange }: { fmt: ContentFormatting; onChange: (p: Partial<ContentFormatting>) => void }) {
  return (
    <View style={styles.formatBar}>
      {/* スタイル */}
      <FmtBtn label="本文" active={fmt.style === "body"} onPress={() => onChange({ style: "body" as TextStyle })} />
      <FmtBtn label="見出し" active={fmt.style === "heading"} onPress={() => onChange({ style: "heading" as TextStyle })} />
      <FmtBtn label="タイトル" active={fmt.style === "title"} onPress={() => onChange({ style: "title" as TextStyle })} />
      <Sep />
      {/* 太字・下線 */}
      <FmtBtn label="B" active={fmt.bold} bold onPress={() => onChange({ bold: !fmt.bold })} />
      <FmtBtn label="U" active={fmt.underline} underline onPress={() => onChange({ underline: !fmt.underline })} />
      <Sep />
      {/* 揃え */}
      <FmtBtn label="←" active={fmt.align === "left"} onPress={() => onChange({ align: "left" as TextAlign })} />
      <FmtBtn label="↔" active={fmt.align === "center"} onPress={() => onChange({ align: "center" as TextAlign })} />
      <FmtBtn label="→" active={fmt.align === "right"} onPress={() => onChange({ align: "right" as TextAlign })} />
      <Sep />
      {/* リスト */}
      <FmtBtn label="•" active={fmt.listType === "bullet"} onPress={() => onChange({ listType: fmt.listType === "bullet" ? undefined : "bullet" as ListType })} />
      <FmtBtn label="☑" active={fmt.listType === "checkbox"} onPress={() => onChange({ listType: fmt.listType === "checkbox" ? undefined : "checkbox" as ListType })} />
    </View>
  );
}

function FmtBtn({ label, active, onPress, bold, underline }: {
  label: string; active: boolean; onPress: () => void; bold?: boolean; underline?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.fmtBtn, active && styles.fmtBtnActive]}>
      <Text style={[
        styles.fmtBtnText,
        active && styles.fmtBtnTextActive,
        bold && { fontWeight: "bold" as const },
        underline && { textDecorationLine: "underline" as const },
      ]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Sep() {
  return <View style={styles.sep} />;
}

// ── キーボードツールバー ───────────────────────────────
function KeyboardToolbar({ onAdd, showFormatBar, onToggleFormat }: {
  onAdd: (type: "piano_roll" | "chord") => void;
  showFormatBar: boolean;
  onToggleFormat: () => void;
}) {
  return (
    <View style={styles.toolbar}>
      <TouchableOpacity onPress={onToggleFormat} style={[styles.toolbarBtn, showFormatBar && styles.toolbarBtnActive]}>
        <Text style={[styles.toolbarBtnIcon, showFormatBar && styles.toolbarBtnIconActive]}>Aa</Text>
      </TouchableOpacity>
      <View style={styles.toolbarDivider} />
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
  fmtTitle: { fontSize: 24, fontWeight: "bold" as const },
  fmtHeading: { fontSize: 19, fontWeight: "600" as const },
  fmtBold: { fontWeight: "bold" as const },
  fmtUnderline: { textDecorationLine: "underline" as const },
  // フォーマットバー
  formatBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "#232340",
    borderTopWidth: 1,
    borderTopColor: "#3a3a5e",
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 2,
  },
  fmtBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  fmtBtnActive: { backgroundColor: "#6655ee" },
  fmtBtnText: { color: "#aaa", fontSize: 13 },
  fmtBtnTextActive: { color: "#fff" },
  sep: { width: 1, height: 20, backgroundColor: "#3a3a5e", marginHorizontal: 3 },
  // キーボードツールバー
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
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  toolbarBtnActive: { backgroundColor: "#3a3a5e" },
  toolbarBtnIcon: { fontSize: 18, color: "#9988cc" },
  toolbarBtnIconActive: { color: "#c0b0ff" },
  toolbarBtnLabel: { fontSize: 14, color: "#c0b0ff" },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#3a3a5e",
    marginHorizontal: 4,
  },
});
