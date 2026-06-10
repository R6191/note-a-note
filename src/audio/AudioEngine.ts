import { Audio } from "expo-av";
import { Note } from "../types";

// MIDI note to frequency
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Generate a simple sine wave WAV buffer as base64
// Returns a base64-encoded WAV for a given frequency and duration
function generateSineWav(freq: number, durationMs: number, amplitude = 0.4): string {
  const sampleRate = 22050;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  const attackSamples = Math.min(Math.floor(sampleRate * 0.01), numSamples);
  const releaseSamples = Math.min(Math.floor(sampleRate * 0.05), numSamples);

  for (let i = 0; i < numSamples; i++) {
    let env = 1.0;
    if (i < attackSamples) env = i / attackSamples;
    else if (i > numSamples - releaseSamples) env = (numSamples - i) / releaseSamples;

    const sample = Math.sin((2 * Math.PI * freq * i) / sampleRate) * amplitude * env;
    view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

let audioModeSet = false;

async function ensureAudioMode() {
  if (audioModeSet) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
  audioModeSet = true;
}

// Play a single MIDI note for durationMs milliseconds
export async function playNote(midi: number, durationMs: number): Promise<void> {
  await ensureAudioMode();
  const freq = midiToFreq(midi);
  const base64 = generateSineWav(freq, durationMs);
  const uri = `data:audio/wav;base64,${base64}`;
  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
  setTimeout(() => sound.unloadAsync(), durationMs + 500);
}

// Play multiple MIDI notes simultaneously (chord)
export async function playChord(midis: number[], durationMs = 600): Promise<void> {
  await Promise.all(midis.map((m) => playNote(m, durationMs)));
}

// Sequencer state
let sequencerTimeout: ReturnType<typeof setTimeout> | null = null;
let onProgressCallback: ((beat: number) => void) | null = null;
let onStopCallback: (() => void) | null = null;

export function stopSequencer() {
  if (sequencerTimeout) {
    clearTimeout(sequencerTimeout);
    sequencerTimeout = null;
  }
  onProgressCallback = null;
  onStopCallback?.();
  onStopCallback = null;
}

export async function playSequence(
  notes: Note[],
  bpm: number,
  onProgress: (beat: number) => void,
  onStop: () => void
): Promise<void> {
  stopSequencer();
  if (notes.length === 0) {
    onStop();
    return;
  }

  await ensureAudioMode();
  onProgressCallback = onProgress;
  onStopCallback = onStop;

  const beatMs = (60 / bpm) * 1000;
  const maxBeat = Math.max(...notes.map((n) => n.beat + n.duration));

  // Group notes by beat for scheduling
  const schedule: Map<number, Note[]> = new Map();
  for (const note of notes) {
    const existing = schedule.get(note.beat) ?? [];
    existing.push(note);
    schedule.set(note.beat, existing);
  }

  const beats = Array.from(schedule.keys()).sort((a, b) => a - b);
  let idx = 0;
  const startTime = Date.now();

  const tick = () => {
    const elapsed = Date.now() - startTime;
    const currentBeat = elapsed / beatMs;
    onProgress(currentBeat);

    if (currentBeat >= maxBeat) {
      onProgress(0);
      onStopCallback?.();
      onStopCallback = null;
      onProgressCallback = null;
      return;
    }

    // Play notes whose beat has arrived
    while (idx < beats.length && beats[idx] <= currentBeat) {
      const beatNotes = schedule.get(beats[idx])!;
      for (const note of beatNotes) {
        const durationMs = note.duration * beatMs * 0.9;
        playNote(note.pitch, durationMs);
      }
      idx++;
    }

    sequencerTimeout = setTimeout(tick, 16);
  };

  sequencerTimeout = setTimeout(tick, 0);
}
