export type TextStyle = "body" | "heading" | "title";
export type TextAlign = "left" | "center" | "right";
export type ListType = "bullet" | "checkbox";

export interface ContentFormatting {
  style: TextStyle;
  align: TextAlign;
  bold: boolean;
  underline: boolean;
  listType?: ListType;
}

export const DEFAULT_FORMATTING: ContentFormatting = {
  style: "body",
  align: "left",
  bold: false,
  underline: false,
};

// テキストブロック
export interface TextBlockData {
  type: "text";
  content: string;
  formatting: ContentFormatting;
}

// ピアノロールブロック
export interface Note {
  id: string;
  pitch: number; // MIDI note number (C3=48, C5=72)
  beat: number;
  duration: number; // in beats
}

export interface PianoRollBlockData {
  type: "piano_roll";
  notes: Note[];
  bpm: number;
}

// コードブロック
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
  blocks: Block[]; // テキスト・譜面・コードすべてを含む
  createdAt: number;
  updatedAt: number;
}
