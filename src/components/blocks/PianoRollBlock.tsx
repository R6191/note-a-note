import React, { memo, useCallback, useRef, useState } from "react";
import {
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { playNote, playSequence, stopSequencer } from "../../audio/AudioEngine";
import { ROOT_NOTES } from "../../audio/chords";
import { generateId } from "../../utils/generateId";
import { Note, PianoRollBlockData } from "../../types";

const MIN_MIDI = 48; // C3
const MAX_MIDI = 72; // C5
const TOTAL_NOTES = MAX_MIDI - MIN_MIDI + 1;

const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
const noteName = (midi: number) => ROOT_NOTES[midi % 12] + Math.floor(midi / 12 - 1);

const ROW_HEIGHT = 28;
const BEAT_WIDTH = 60;
const KEY_WIDTH = 44;
const TOTAL_BEATS = 16;

interface Props {
  data: PianoRollBlockData;
  onChange: (data: PianoRollBlockData) => void;
  onDelete: () => void;
}

export default function PianoRollBlock({ data, onChange, onDelete }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playBeat, setPlayBeat] = useState(0);
  const bpm = data.bpm;
  const notes = data.notes;

  const updateNotes = useCallback(
    (newNotes: Note[]) => onChange({ ...data, notes: newNotes }),
    [data, onChange]
  );

  const handleKeyPress = (midi: number) => {
    playNote(midi, 300);
    const existingBeats = notes.filter((n) => n.pitch === midi).map((n) => n.beat);
    let beat = 0;
    while (existingBeats.includes(beat)) beat++;
    updateNotes([...notes, { id: generateId(), pitch: midi, beat, duration: 1 }]);
  };

  const handleNoteDelete = (id: string) => {
    updateNotes(notes.filter((n) => n.id !== id));
  };

  const handlePlayStop = () => {
    if (isPlaying) {
      stopSequencer();
      setIsPlaying(false);
      setPlayBeat(0);
    } else {
      setIsPlaying(true);
      playSequence(
        notes,
        bpm,
        (beat) => setPlayBeat(beat),
        () => {
          setIsPlaying(false);
          setPlayBeat(0);
        }
      );
    }
  };

  const setBpm = (val: number) => {
    onChange({ ...data, bpm: Math.max(40, Math.min(240, val)) });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePlayStop} style={styles.playBtn}>
          <Text style={styles.playBtnText}>{isPlaying ? "⏹" : "▶"}</Text>
        </TouchableOpacity>
        <View style={styles.bpmRow}>
          <TouchableOpacity onPress={() => setBpm(bpm - 5)} style={styles.bpmBtn}>
            <Text style={styles.bpmBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.bpmLabel}>{bpm} BPM</Text>
          <TouchableOpacity onPress={() => setBpm(bpm + 5)} style={styles.bpmBtn}>
            <Text style={styles.bpmBtnText}>＋</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row" }}>
          <View style={styles.keysColumn}>
            {Array.from({ length: TOTAL_NOTES }, (_, i) => {
              const midi = MAX_MIDI - i;
              const black = isBlack(midi);
              return (
                <TouchableOpacity
                  key={midi}
                  onPress={() => handleKeyPress(midi)}
                  style={[styles.key, black ? styles.keyBlack : styles.keyWhite]}
                >
                  <Text style={[styles.keyLabel, black && styles.keyLabelBlack]}>
                    {midi % 12 === 0 ? noteName(midi) : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ width: BEAT_WIDTH * TOTAL_BEATS, height: ROW_HEIGHT * TOTAL_NOTES }}>
              {Array.from({ length: TOTAL_NOTES }, (_, i) => {
                const midi = MAX_MIDI - i;
                const black = isBlack(midi);
                return (
                  <View
                    key={midi}
                    style={[
                      styles.gridRow,
                      { top: i * ROW_HEIGHT },
                      black && styles.gridRowBlack,
                    ]}
                  />
                );
              })}
              {Array.from({ length: TOTAL_BEATS + 1 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.gridCol,
                    { left: i * BEAT_WIDTH },
                    i % 4 === 0 && styles.gridColBold,
                  ]}
                />
              ))}

              {isPlaying && (
                <View style={[styles.playhead, { left: playBeat * BEAT_WIDTH }]} />
              )}

              {notes.map((note) => {
                const row = MAX_MIDI - note.pitch;
                if (row < 0 || row >= TOTAL_NOTES) return null;
                return (
                  <NoteBar
                    key={note.id}
                    note={note}
                    top={row * ROW_HEIGHT}
                    onDelete={() => handleNoteDelete(note.id)}
                    onDurationChange={(dur) => {
                      updateNotes(
                        notes.map((n) => (n.id === note.id ? { ...n, duration: dur } : n))
                      );
                    }}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const NoteBar = memo(function NoteBar({
  note,
  top,
  onDelete,
  onDurationChange,
}: {
  note: Note;
  top: number;
  onDelete: () => void;
  onDurationChange: (dur: number) => void;
}) {
  const startX = useRef(0);
  const startDuration = useRef(note.duration);
  // Keep latest callbacks in refs so the PanResponder (created once) never goes stale
  const onDurationChangeRef = useRef(onDurationChange);
  onDurationChangeRef.current = onDurationChange;
  const noteDurationRef = useRef(note.duration);
  noteDurationRef.current = note.duration;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        startX.current = e.nativeEvent.pageX;
        startDuration.current = noteDurationRef.current;
      },
      onPanResponderMove: (e) => {
        const dx = e.nativeEvent.pageX - startX.current;
        const deltaBeat = dx / BEAT_WIDTH;
        const newDur = Math.max(0.25, Math.round((startDuration.current + deltaBeat) * 4) / 4);
        onDurationChangeRef.current(newDur);
      },
    })
  ).current;

  const width = note.duration * BEAT_WIDTH - 2;

  return (
    <View
      style={[
        styles.noteBar,
        {
          left: note.beat * BEAT_WIDTH + 1,
          top: top + 2,
          width: Math.max(width, 10),
        },
      ]}
    >
      <TouchableOpacity onLongPress={onDelete} style={{ flex: 1 }}>
        <View style={{ flex: 1 }} />
      </TouchableOpacity>
      <View {...panResponder.panHandlers} style={styles.noteHandle} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e1e3a",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#2a2a4e",
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6655ee",
    justifyContent: "center",
    alignItems: "center",
  },
  playBtnText: { color: "#fff", fontSize: 16 },
  bpmRow: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  bpmBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#3a3a5e",
    justifyContent: "center",
    alignItems: "center",
  },
  bpmBtnText: { color: "#e0e0ff", fontSize: 18, lineHeight: 22 },
  bpmLabel: { color: "#e0e0ff", fontSize: 14, marginHorizontal: 8 },
  deleteBtn: { marginLeft: "auto", padding: 8 },
  deleteBtnText: { color: "#f55", fontSize: 16 },
  keysColumn: { width: KEY_WIDTH },
  key: {
    height: ROW_HEIGHT,
    width: KEY_WIDTH,
    justifyContent: "center",
    paddingLeft: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  keyWhite: { backgroundColor: "#e8e8f0" },
  keyBlack: { backgroundColor: "#2a2a3e" },
  keyLabel: { fontSize: 9, color: "#555" },
  keyLabelBlack: { color: "#aaa" },
  gridRow: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2a2a4e",
  },
  gridRowBlack: { backgroundColor: "#1a1a2e" },
  gridCol: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: "#2a2a4e",
  },
  gridColBold: { backgroundColor: "#4a4a6e", width: 1 },
  playhead: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#ff6644",
  },
  noteBar: {
    position: "absolute",
    height: ROW_HEIGHT - 4,
    backgroundColor: "#6655ee",
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden",
  },
  noteHandle: {
    width: 8,
    backgroundColor: "#9988ff",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
});
