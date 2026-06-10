import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TextBlockData, TextAlign, TextStyle } from "../../types";

interface Props {
  data: TextBlockData;
  onChange: (data: TextBlockData) => void;
  onDelete: () => void;
}

export default function TextBlock({ data, onChange, onDelete }: Props) {
  const [focused, setFocused] = useState(false);
  const text = data.spans.map((s) => s.text).join("");

  const handleChangeText = (val: string) => {
    onChange({ ...data, spans: [{ text: val, bold: data.spans[0]?.bold, underline: data.spans[0]?.underline }] });
  };

  const toggleBold = () => {
    const bold = !data.spans[0]?.bold;
    onChange({ ...data, spans: data.spans.map((s) => ({ ...s, bold })) });
  };

  const toggleUnderline = () => {
    const underline = !data.spans[0]?.underline;
    onChange({ ...data, spans: data.spans.map((s) => ({ ...s, underline })) });
  };

  const setStyle = (style: TextStyle) => onChange({ ...data, style });
  const setAlign = (align: TextAlign) => onChange({ ...data, align });

  const setListType = (listType: "bullet" | "checkbox" | undefined) => {
    onChange({ ...data, listType: data.listType === listType ? undefined : listType });
  };

  const isBold = data.spans[0]?.bold ?? false;
  const isUnderline = data.spans[0]?.underline ?? false;

  const textStyle = [
    styles.input,
    data.style === "title" && styles.styleTitle,
    data.style === "heading" && styles.styleHeading,
    { textAlign: data.align },
    isBold && { fontWeight: "bold" as const },
    isUnderline && { textDecorationLine: "underline" as const },
  ];

  return (
    <View style={styles.container}>
      {focused && (
        <View style={styles.toolbar}>
          <ToolBtn label="B" active={isBold} onPress={toggleBold} bold />
          <ToolBtn label="U" active={isUnderline} onPress={toggleUnderline} underline />
          <View style={styles.sep} />
          <ToolBtn label="T" active={data.style === "title"} onPress={() => setStyle("title")} />
          <ToolBtn label="H" active={data.style === "heading"} onPress={() => setStyle("heading")} />
          <ToolBtn label="P" active={data.style === "body"} onPress={() => setStyle("body")} />
          <View style={styles.sep} />
          <ToolBtn label="≡" active={data.listType === "bullet"} onPress={() => setListType("bullet")} />
          <ToolBtn label="☑" active={data.listType === "checkbox"} onPress={() => setListType("checkbox")} />
          <View style={styles.sep} />
          <ToolBtn label="←" active={data.align === "left"} onPress={() => setAlign("left")} />
          <ToolBtn label="↔" active={data.align === "center"} onPress={() => setAlign("center")} />
          <ToolBtn label="→" active={data.align === "right"} onPress={() => setAlign("right")} />
          <View style={styles.sep} />
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputRow}>
        {data.listType === "bullet" && (
          <Text style={styles.bullet}>•</Text>
        )}
        {data.listType === "checkbox" && (
          <TouchableOpacity onPress={() => onChange({ ...data, checked: !data.checked })}>
            <Text style={styles.checkbox}>{data.checked ? "☑" : "☐"}</Text>
          </TouchableOpacity>
        )}
        <TextInput
          style={textStyle}
          multiline
          value={text}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="テキストを入力..."
          placeholderTextColor="#666"
        />
      </View>
    </View>
  );
}

function ToolBtn({
  label,
  active,
  onPress,
  bold,
  underline,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  bold?: boolean;
  underline?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.toolBtn, active && styles.toolBtnActive]}
    >
      <Text
        style={[
          styles.toolBtnText,
          active && styles.toolBtnTextActive,
          bold && { fontWeight: "bold" },
          underline && { textDecorationLine: "underline" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4 },
  toolbar: {
    flexDirection: "row",
    backgroundColor: "#2a2a4e",
    borderRadius: 8,
    padding: 4,
    marginBottom: 4,
    flexWrap: "wrap",
    alignItems: "center",
  },
  toolBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 1,
  },
  toolBtnActive: { backgroundColor: "#6655ee" },
  toolBtnText: { color: "#aaa", fontSize: 13 },
  toolBtnTextActive: { color: "#fff" },
  sep: { width: 1, height: 20, backgroundColor: "#444", marginHorizontal: 4 },
  deleteBtn: { marginLeft: "auto", paddingHorizontal: 8, paddingVertical: 4 },
  deleteBtnText: { color: "#f55", fontSize: 14 },
  inputRow: { flexDirection: "row", alignItems: "flex-start" },
  bullet: { color: "#e0e0ff", fontSize: 18, marginRight: 6, marginTop: 2 },
  checkbox: { color: "#e0e0ff", fontSize: 18, marginRight: 6, marginTop: 2 },
  input: {
    flex: 1,
    color: "#e0e0ff",
    fontSize: 15,
    lineHeight: 22,
    padding: 4,
  },
  styleTitle: { fontSize: 24, fontWeight: "bold" },
  styleHeading: { fontSize: 19, fontWeight: "600" },
});
