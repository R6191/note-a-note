import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { playChord } from "../../audio/AudioEngine";
import { chordToMidi, chordName } from "../../audio/chords";
import ChordPickerModal from "../ChordPickerModal";
import { ChordBlockData } from "../../types";

interface Props {
  data: ChordBlockData;
  onChange: (data: ChordBlockData) => void;
  onDelete: () => void;
}

export default function ChordBlock({ data, onChange, onDelete }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleTap = () => {
    playChord(chordToMidi(data.root, data.chordType), 600);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleTap} onLongPress={() => setModalVisible(true)} style={styles.chordBtn}>
        <Text style={styles.chordName}>{chordName(data.root, data.chordType)}</Text>
        <Text style={styles.hint}>タップ:再生  長押し:編集</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editBtn}>
        <Text style={styles.editBtnText}>✎</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>

      <ChordPickerModal
        visible={modalVisible}
        initialRoot={data.root}
        initialType={data.chordType}
        onConfirm={(root, chordType) => onChange({ ...data, root, chordType })}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a4e",
    borderRadius: 10,
    marginVertical: 4,
    overflow: "hidden",
  },
  chordBtn: {
    flex: 1,
    padding: 14,
  },
  chordName: { color: "#e0e0ff", fontSize: 22, fontWeight: "bold" },
  hint: { color: "#888", fontSize: 11, marginTop: 2 },
  editBtn: { padding: 14 },
  editBtnText: { color: "#9988cc", fontSize: 20 },
  deleteBtn: { padding: 14 },
  deleteBtnText: { color: "#f55", fontSize: 16 },
});
