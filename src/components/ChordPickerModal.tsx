import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { playChord } from "../audio/AudioEngine";
import { chordToMidi, chordName, ROOT_NOTES, CHORD_TYPES } from "../audio/chords";
import { ChordRoot, ChordType } from "../types";

interface Props {
  visible: boolean;
  initialRoot: ChordRoot;
  initialType: ChordType;
  onConfirm: (root: ChordRoot, chordType: ChordType) => void;
  onClose: () => void;
}

export default function ChordPickerModal({ visible, initialRoot, initialType, onConfirm, onClose }: Props) {
  const [root, setRoot] = useState<ChordRoot>(initialRoot);
  const [type, setType] = useState<ChordType>(initialType);

  const handlePreview = () => {
    playChord(chordToMidi(root, type), 800);
  };

  const handleConfirm = () => {
    onConfirm(root, type);
    onClose();
  };

  const CHORD_TYPE_LABELS: Record<ChordType, string> = {
    major: "Major",
    minor: "Minor",
    "7": "Dominant 7th",
    m7: "Minor 7th",
    maj7: "Major 7th",
    dim: "Diminished",
    aug: "Augmented",
    sus2: "Sus2",
    sus4: "Sus4",
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>コード選択</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>ルート音</Text>
          <View style={styles.rootGrid}>
            {ROOT_NOTES.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRoot(r)}
                style={[styles.rootBtn, root === r && styles.rootBtnActive]}
              >
                <Text style={[styles.rootBtnText, root === r && styles.rootBtnTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>コードタイプ</Text>
          <FlatList
            data={CHORD_TYPES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setType(item)}
                style={[styles.typeRow, type === item && styles.typeRowActive]}
              >
                <Text style={[styles.typeLabel, type === item && styles.typeLabelActive]}>
                  {CHORD_TYPE_LABELS[item]}
                </Text>
                <Text style={[styles.typeSymbol, type === item && styles.typeLabelActive]}>
                  {chordName(root, item)}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.typeList}
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={handlePreview} style={styles.previewBtn}>
              <Text style={styles.previewBtnText}>▶ 試し聴き</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={styles.confirmBtnText}>確定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#1e1e3a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { color: "#e0e0ff", fontSize: 18, fontWeight: "bold" },
  closeBtn: { color: "#888", fontSize: 20 },
  sectionLabel: { color: "#9988cc", fontSize: 13, marginBottom: 8 },
  rootGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  rootBtn: {
    width: 44,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#2a2a4e",
    justifyContent: "center",
    alignItems: "center",
  },
  rootBtnActive: { backgroundColor: "#6655ee" },
  rootBtnText: { color: "#aaa", fontSize: 14 },
  rootBtnTextActive: { color: "#fff", fontWeight: "bold" },
  typeList: { maxHeight: 220 },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#2a2a4e",
  },
  typeRowActive: { backgroundColor: "#6655ee" },
  typeLabel: { color: "#ccc", fontSize: 15 },
  typeLabelActive: { color: "#fff", fontWeight: "600" },
  typeSymbol: { color: "#888", fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  previewBtn: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#3a3a5e",
    alignItems: "center",
  },
  previewBtnText: { color: "#e0e0ff", fontSize: 15 },
  confirmBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#6655ee",
    alignItems: "center",
  },
  confirmBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
