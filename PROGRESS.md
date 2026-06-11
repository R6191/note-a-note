# Note a Note - 進捗・決定事項

## 進捗状況

| フェーズ | ステータス | 完了日 |
|---------|-----------|--------|
| 1. アイデア壁打ち・仕様固め | ✅ 完了 | - |
| 2. SPEC.md作成 | ✅ 完了 | - |
| 2.7. アーキテクチャ図・機能一覧作成 | ✅ 完了 | - |
| 2.8. 動作確認チェックリスト作成 | ✅ 完了 | - |
| 3. 実装 | ✅ 完了 | 2026-06-10 |
| 3.5. コードレビュー | ✅ 完了 | 2026-06-11 |
| 3.6. 実装済み機能一覧の更新 | ✅ 完了 | 2026-06-11 |
| 4. 動作確認・FB・修正 | 🚧 進行中 | - |

## 決定事項

### 技術選定
- **フレームワーク**: React Native + Expo SDK 51
- **音声**: expo-av（Web Audio API相当、外部サービス不要）
- **ストレージ**: AsyncStorage（シンプル、ローカルのみ）
- **状態管理**: Zustand
- **ナビゲーション**: Expo Router

### アーキテクチャ決定
- ブロック型エディタ（Notion風）：TextBlock / PianoRollBlock / ChordBlock
- データはJSON配列でシリアライズ保存
- AudioEngineはexpo-avラッパーとして実装、BPMシーケンサー内蔵

### 音声設計
- 音色：シンセ固定（外部音源なし）
- expo-av の `mixWithOthers` モードでBGM共存
- ノート再生：Web Audio API相当のオシレーター波形合成

## 実装ログ

### 2026-06-10
- PROGRESS.md 作成
- フェーズ3（実装）開始・完了
- Expo Router + Zustand + AsyncStorage でプロジェクト基盤を構築
- TextBlock / PianoRollBlock / ChordBlock をすべて実装
- AudioEngine（expo-av + WAV合成シンセ）実装
- メモ一覧・検索・削除・新規作成を実装
- TypeScript型チェック通過確認
- git commit 完了

### 2026-06-11
- フェーズ3.5 コードレビュー完了・修正適用
  - generateId を utils に抽出、NOTE_NAMES 重複解消
  - NoteBar PanResponder staleクロージャ修正（ref パターン）
  - saveMemos デバウンス（400ms）追加
  - WAVバッファキャッシュ、Sound.unloadAsync エラーハンドリング
  - 不要な型キャスト・unused import 削除
- フェーズ3.6 実装済み機能一覧の確認・更新完了

## 実装済み機能（コード確認済み）

| 機能 | ファイル | 状態 |
|------|---------|------|
| メモ新規作成・一覧・検索・削除 | `app/index.tsx`, `src/store/useStore.ts` | ✅ |
| メモタイトル編集 | `app/memo/[id].tsx` | ✅ |
| テキストブロック（書式・箇条書き・チェックボックス・揃え） | `src/components/blocks/TextBlock.tsx` | ✅ |
| ピアノロール（C3〜C5・ドラッグ音長・再生ヘッド・BPM） | `src/components/blocks/PianoRollBlock.tsx` | ✅ |
| コードブロック（タップ再生・2段階ピッカー・試し聴き） | `src/components/blocks/ChordBlock.tsx` | ✅ |
| WAVシンセ音源（キャッシュ付き）・BPMシーケンサー | `src/audio/AudioEngine.ts` | ✅ |
| AsyncStorage 永続化（デバウンス保存） | `src/storage/storage.ts` | ✅ |
| ブロックのドラッグ&ドロップ並び替え | 未実装 | ⬜ |

## 未実装
- ブロックのドラッグ&ドロップ並び替え（react-native-draggable-flatlistの追加が必要）
