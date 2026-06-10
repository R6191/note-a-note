import { ChordRoot, ChordType } from "../types";

const ROOT_NOTES: ChordRoot[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const ROOT_TO_SEMITONE: Record<ChordRoot, number> = {
  C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5,
  "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
};

const CHORD_INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  "7": [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

// Returns MIDI notes for a chord, rooted at octave 4
export function chordToMidi(root: ChordRoot, chordType: ChordType): number[] {
  const semitone = ROOT_TO_SEMITONE[root];
  const rootMidi = 48 + semitone; // C4 = 60, use C3 = 48 as base
  return CHORD_INTERVALS[chordType].map((interval) => rootMidi + interval);
}

export function chordName(root: ChordRoot, chordType: ChordType): string {
  const suffixes: Record<ChordType, string> = {
    major: "",
    minor: "m",
    "7": "7",
    m7: "m7",
    maj7: "M7",
    dim: "dim",
    aug: "aug",
    sus2: "sus2",
    sus4: "sus4",
  };
  return `${root}${suffixes[chordType]}`;
}

export { ROOT_NOTES, CHORD_INTERVALS };
export const CHORD_TYPES: ChordType[] = ["major", "minor", "7", "m7", "maj7", "dim", "aug", "sus2", "sus4"];
