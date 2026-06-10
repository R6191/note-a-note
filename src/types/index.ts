export type BlockType = "text" | "piano_roll" | "chord";

export type TextStyle = "title" | "heading" | "body";
export type TextAlign = "left" | "center" | "right";

export interface TextSpan {
  text: string;
  bold?: boolean;
  underline?: boolean;
}

export interface TextBlockData {
  type: "text";
  style: TextStyle;
  align: TextAlign;
  spans: TextSpan[];
  listType?: "bullet" | "checkbox";
  checked?: boolean;
}

export interface Note {
  id: string;
  pitch: number; // MIDI note number (C3=48, C5=72)
  beat: number;  // beat position (0-based)
  duration: number; // in beats (0.25 = 16th note, 1 = quarter)
}

export interface PianoRollBlockData {
  type: "piano_roll";
  notes: Note[];
  bpm: number;
}

export type ChordRoot = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";
export type ChordType = "major" | "minor" | "7" | "m7" | "maj7" | "dim" | "aug" | "sus2" | "sus4";

export interface ChordBlockData {
  type: "chord";
  root: ChordRoot;
  chordType: ChordType;
}

export type BlockData = TextBlockData | PianoRollBlockData | ChordBlockData;

export interface Block {
  id: string;
  data: BlockData;
}

export interface Memo {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}
