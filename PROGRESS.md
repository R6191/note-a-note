# Note a Note - 進捗・決定事項

## 進捗状況

| フェーズ | ステータス | 完了日 |
|---------|-----------|--------|
| 1. アイデア壁打ち・仕様固め | ✅ 完了 | - |
| 2. SPEC.md作成 | ✅ 完了 | - |
| 2.7. アーキテクチャ図・機能一覧作成 | ✅ 完了 | - |
| 2.8. 動作確認チェックリスト作成 | ✅ 完了 | - |
| 3. 実装 | ✅ 完了 | 2026-06-10 |

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

## 未実装（次フェーズ以降で対応）
- ブロックのドラッグ&ドロップ並び替え（react-native-draggable-flatlistの追加が必要）
