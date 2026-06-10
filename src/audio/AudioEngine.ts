import { Audio } from "expo-av";
import { Note } from "../types";

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function generateSineWav(freq: number, durationMs: number, amplitude = 0.4): string {
  const sampleRate = 22050;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
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

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Cache base64 WAV strings keyed by "midi:durationMs" to avoid re-generating identical buffers
const wavCache = new Map<string, string>();

function getCachedWav(midi: number, durationMs: number): string {
  const key = `${midi}:${durationMs}`;
  let wav = wavCache.get(key);
  if (!wav) {
    wav = generateSineWav(midiToFreq(midi), durationMs);
    wavCache.set(key, wav);
  }
  return wav;
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

export async function playNote(midi: number, durationMs: number): Promise<void> {
  await ensureAudioMode();
  const base64 = getCachedWav(midi, durationMs);
  const uri = `data:audio/wav;base64,${base64}`;
  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
  setTimeout(() => sound.unloadAsync().catch(() => {}), durationMs + 500);
}

export async function playChord(midis: number[], durationMs = 600): Promise<void> {
  await Promise.all(midis.map((m) => playNote(m, durationMs)));
}

let sequencerTimeout: ReturnType<typeof setTimeout> | null = null;
let onStopCallback: (() => void) | null = null;

export function stopSequencer() {
  if (sequencerTimeout) {
    clearTimeout(sequencerTimeout);
    sequencerTimeout = null;
  }
  const cb = onStopCallback;
  onStopCallback = null;
  cb?.();
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
  onStopCallback = onStop;

  const beatMs = (60 / bpm) * 1000;
  const maxBeat = Math.max(...notes.map((n) => n.beat + n.duration));

  const schedule = new Map<number, Note[]>();
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
      sequencerTimeout = null;
      onProgress(0);
      const cb = onStopCallback;
      onStopCallback = null;
      cb?.();
      return;
    }

    while (idx < beats.length && beats[idx] <= currentBeat) {
      const beatNotes = schedule.get(beats[idx])!;
      for (const note of beatNotes) {
        playNote(note.pitch, note.duration * beatMs * 0.9);
      }
      idx++;
    }

    sequencerTimeout = setTimeout(tick, 16);
  };

  sequencerTimeout = setTimeout(tick, 0);
}
