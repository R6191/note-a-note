import { create } from "zustand";
import { Memo, Block, BlockData, ContentFormatting, DEFAULT_FORMATTING } from "../types";
import { loadMemos, saveMemos } from "../storage/storage";
import { generateId } from "../utils/generateId";

function makeTextBlock(content = ""): Block {
  return {
    id: generateId(),
    data: { type: "text", content, formatting: { ...DEFAULT_FORMATTING } },
  };
}

interface StoreState {
  memos: Memo[];
  loaded: boolean;
  hydrate: () => Promise<void>;
  createMemo: () => Memo;
  updateMemoTitle: (memoId: string, title: string) => void;
  deleteMemo: (memoId: string) => void;
  // ブロック操作
  updateBlock: (memoId: string, blockId: string, data: BlockData) => void;
  deleteBlock: (memoId: string, blockId: string) => void;
  // テキストブロック専用
  updateTextContent: (memoId: string, blockId: string, content: string) => void;
  updateTextFormatting: (memoId: string, blockId: string, formatting: ContentFormatting) => void;
  // 挿入（afterBlockId の後ろに新ブロック＋空テキストブロックを挿入）
  insertBlockAfter: (memoId: string, afterBlockId: string, data: BlockData) => { newBlockId: string; newTextBlockId: string };
  reorderBlocks: (memoId: string, blocks: Block[]) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  memos: [],
  loaded: false,

  hydrate: async () => {
    const rawMemos = await loadMemos();
    const migrated = (rawMemos as any[]).map((m: any) => {
      let blocks: Block[] = m.blocks ?? [];

      // 旧v1: memo.content + memo.formatting → TextBlockに変換
      if (m.content !== undefined) {
        const textBlock = makeTextBlock(m.content ?? "");
        blocks = [textBlock, ...blocks.filter((b: any) => b.data?.type !== "text")];
      }

      // 旧v1: spans形式のTextBlockをcontentベースに変換
      blocks = blocks.map((b: any) => {
        if (b.data?.type === "text" && b.data.spans !== undefined) {
          const content = (b.data.spans as any[]).map((s: any) => s.text ?? "").join("");
          return {
            ...b,
            data: {
              type: "text",
              content,
              formatting: { ...DEFAULT_FORMATTING },
            },
          };
        }
        // contentフィールドがないTextBlockを補完
        if (b.data?.type === "text" && b.data.content === undefined) {
          return { ...b, data: { ...b.data, content: "", formatting: b.data.formatting ?? { ...DEFAULT_FORMATTING } } };
        }
        return b;
      });

      // テキストブロックが1つもなければ先頭に追加
      const hasText = blocks.some((b: any) => b.data?.type === "text");
      if (!hasText) blocks = [makeTextBlock(), ...blocks];

      const { content, formatting, ...rest } = m;
      return { ...rest, blocks };
    });
    set({ memos: migrated, loaded: true });
  },

  createMemo: () => {
    const memo: Memo = {
      id: generateId(),
      title: "",
      blocks: [makeTextBlock()],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const memos = [memo, ...get().memos];
    set({ memos });
    saveMemos(memos);
    return memo;
  },

  updateMemoTitle: (memoId, title) => {
    const memos = get().memos.map((m) =>
      m.id === memoId ? { ...m, title, updatedAt: Date.now() } : m
    );
    set({ memos });
    saveMemos(memos);
  },

  deleteMemo: (memoId) => {
    const memos = get().memos.filter((m) => m.id !== memoId);
    set({ memos });
    saveMemos(memos);
  },

  updateBlock: (memoId, blockId, data) => {
    const memos = get().memos.map((m) => {
      if (m.id !== memoId) return m;
      return {
        ...m,
        blocks: m.blocks.map((b) => (b.id === blockId ? { ...b, data } : b)),
        updatedAt: Date.now(),
      };
    });
    set({ memos });
    saveMemos(memos);
  },

  updateTextContent: (memoId, blockId, content) => {
    const memos = get().memos.map((m) => {
      if (m.id !== memoId) return m;
      return {
        ...m,
        blocks: m.blocks.map((b) =>
          b.id === blockId && b.data.type === "text"
            ? { ...b, data: { ...b.data, content } }
            : b
        ),
        updatedAt: Date.now(),
      };
    });
    set({ memos });
    saveMemos(memos);
  },

  updateTextFormatting: (memoId, blockId, formatting) => {
    const memos = get().memos.map((m) => {
      if (m.id !== memoId) return m;
      return {
        ...m,
        blocks: m.blocks.map((b) =>
          b.id === blockId && b.data.type === "text"
            ? { ...b, data: { ...b.data, formatting } }
            : b
        ),
        updatedAt: Date.now(),
      };
    });
    set({ memos });
    saveMemos(memos);
  },

  deleteBlock: (memoId, blockId) => {
    const memos = get().memos.map((m) => {
      if (m.id !== memoId) return m;
      const blocks = m.blocks.filter((b) => b.id !== blockId);
      // テキストブロックが1つもなくなったら末尾に追加
      const hasText = blocks.some((b) => b.data.type === "text");
      return {
        ...m,
        blocks: hasText ? blocks : [...blocks, makeTextBlock()],
        updatedAt: Date.now(),
      };
    });
    set({ memos });
    saveMemos(memos);
  },

  insertBlockAfter: (memoId, afterBlockId, data) => {
    const newBlockId = generateId();
    const newTextBlockId = generateId();
    const newBlock: Block = { id: newBlockId, data };
    const newTextBlock: Block = makeTextBlock();
    const textBlockWithId: Block = { ...newTextBlock, id: newTextBlockId };

    const memos = get().memos.map((m) => {
      if (m.id !== memoId) return m;
      const idx = m.blocks.findIndex((b) => b.id === afterBlockId);
      const blocks = [...m.blocks];
      blocks.splice(idx + 1, 0, newBlock, textBlockWithId);
      return { ...m, blocks, updatedAt: Date.now() };
    });
    set({ memos });
    saveMemos(memos);
    return { newBlockId, newTextBlockId };
  },

  reorderBlocks: (memoId, blocks) => {
    const memos = get().memos.map((m) =>
      m.id === memoId ? { ...m, blocks, updatedAt: Date.now() } : m
    );
    set({ memos });
    saveMemos(memos);
  },
}));
