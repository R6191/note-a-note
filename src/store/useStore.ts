import { create } from "zustand";
import { Memo, Block, BlockData } from "../types";
import { loadMemos, saveMemos } from "../storage/storage";
import { generateId } from "../utils/generateId";

interface StoreState {
  memos: Memo[];
  loaded: boolean;
  hydrate: () => Promise<void>;
  createMemo: () => Memo;
  updateMemoTitle: (memoId: string, title: string) => void;
  deleteMemo: (memoId: string) => void;
  addBlock: (memoId: string, data: BlockData) => Block;
  updateBlock: (memoId: string, blockId: string, data: BlockData) => void;
  deleteBlock: (memoId: string, blockId: string) => void;
  reorderBlocks: (memoId: string, blocks: Block[]) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  memos: [],
  loaded: false,

  hydrate: async () => {
    const memos = await loadMemos();
    set({ memos, loaded: true });
  },

  createMemo: () => {
    const memo: Memo = {
      id: generateId(),
      title: "",
      blocks: [],
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

  addBlock: (memoId, data) => {
    const block: Block = { id: generateId(), data };
    const memos = get().memos.map((m) =>
      m.id === memoId
        ? { ...m, blocks: [...m.blocks, block], updatedAt: Date.now() }
        : m
    );
    set({ memos });
    saveMemos(memos);
    return block;
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

  deleteBlock: (memoId, blockId) => {
    const memos = get().memos.map((m) => {
      if (m.id !== memoId) return m;
      return {
        ...m,
        blocks: m.blocks.filter((b) => b.id !== blockId),
        updatedAt: Date.now(),
      };
    });
    set({ memos });
    saveMemos(memos);
  },

  reorderBlocks: (memoId, blocks) => {
    const memos = get().memos.map((m) =>
      m.id === memoId ? { ...m, blocks, updatedAt: Date.now() } : m
    );
    set({ memos });
    saveMemos(memos);
  },
}));
