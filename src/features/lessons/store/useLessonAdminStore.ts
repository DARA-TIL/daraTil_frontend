import { create } from "zustand";
import type {
  Lesson,
  LessonCreateDto,
  LessonUpdateDto,
  LessonBlock,
  LessonBlockCreateDto,
  LessonBlockUpdateDto,
} from "../model/types";
import LessonsService from "../api/LessonsService";
import LessonsAdminService from "../api/LessonAdminService";

type Filters = {
  search: string;
};

type State = {
  items: Lesson[];
  selected: Lesson | null;
  loading: boolean;

  filters: Filters;
  setFilter: (k: keyof Filters, v: string) => void;
  resetFilters: () => void;

  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<Lesson | null>;

  create: (payload: LessonCreateDto) => Promise<Lesson | null>;
  update: (id: number, payload: LessonUpdateDto) => Promise<boolean>;
  remove: (id: number) => Promise<boolean>;

  // blocks
  createBlock: (payload: LessonBlockCreateDto) => Promise<LessonBlock | null>;
  updateBlock: (
    id: number,
    payload: LessonBlockUpdateDto,
  ) => Promise<LessonBlock | null>;
  deleteBlock: (id: number) => Promise<boolean>;

  // reorder helpers
  moveBlockUp: (blockId: number) => Promise<void>;
  moveBlockDown: (blockId: number) => Promise<void>;
};

function sortBlocks(blocks: LessonBlock[] = []) {
  return [...blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export const useLessonsAdminStore = create<State>((set, get) => ({
  items: [],
  selected: null,
  loading: false,

  filters: { search: "" },
  setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
  resetFilters: () => set({ filters: { search: "" } }),

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await LessonsService.getAll(); // админке тоже ок
      set({ items: data });
    } finally {
      set({ loading: false });
    }
  },

  fetchById: async (id) => {
    set({ loading: true });
    try {
      const lesson = await LessonsService.getById(id);
      set({ selected: { ...lesson, blocks: sortBlocks(lesson.blocks ?? []) } });
      return lesson;
    } catch {
      set({ selected: null });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true });
    try {
      const created = await LessonsAdminService.create(payload);
      // обновим список
      set((s) => ({ items: [created, ...s.items] }));
      return created;
    } catch {
      return null;
    } finally {
      set({ loading: false });
    }
  },

  update: async (id, payload) => {
    set({ loading: true });
    try {
      await LessonsAdminService.update(id, payload);

      // обновим selected локально
      set((s) => {
        if (!s.selected || s.selected.ID !== id) return s;
        return { selected: { ...s.selected, ...payload } as Lesson };
      });

      // и список
      set((s) => ({
        items: s.items.map((x) =>
          x.ID === id ? ({ ...x, ...payload } as Lesson) : x,
        ),
      }));

      return true;
    } catch {
      return false;
    } finally {
      set({ loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true });
    try {
      await LessonsAdminService.remove(id);
      set((s) => ({ items: s.items.filter((x) => x.ID !== id) }));
      return true;
    } catch {
      return false;
    } finally {
      set({ loading: false });
    }
  },

  createBlock: async (payload) => {
    set({ loading: true });
    try {
      const created = await LessonsAdminService.createBlock(payload);

      set((s) => {
        if (!s.selected || s.selected.ID !== payload.lessonID) return s;
        const blocks = sortBlocks([...(s.selected.blocks ?? []), created]);
        return { selected: { ...s.selected, blocks } };
      });

      return created;
    } catch {
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateBlock: async (id, payload) => {
    set({ loading: true });
    try {
      const updated = await LessonsAdminService.updateBlock(id, payload);

      set((s) => {
        if (!s.selected) return s;
        const blocks = (s.selected.blocks ?? []).map((b) =>
          b.id === id ? ({ ...b, ...payload, ...updated } as LessonBlock) : b,
        );
        return { selected: { ...s.selected, blocks: sortBlocks(blocks) } };
      });

      return updated;
    } catch {
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteBlock: async (id) => {
    set({ loading: true });
    try {
      await LessonsAdminService.deleteBlock(id);
      set((s) => {
        if (!s.selected) return s;
        const blocks = (s.selected.blocks ?? []).filter((b) => b.id !== id);
        return { selected: { ...s.selected, blocks: sortBlocks(blocks) } };
      });
      return true;
    } catch {
      return false;
    } finally {
      set({ loading: false });
    }
  },

  moveBlockUp: async (blockId) => {
    const sel = get().selected;
    if (!sel?.blocks?.length) return;

    const blocks = sortBlocks(sel.blocks);
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx <= 0) return;

    const current = blocks[idx];
    const prev = blocks[idx - 1];

    // backend делает swap если позиция занята
    await get().updateBlock(current.id, {
      lessonID: sel.ID,
      position: prev.position,
    });
    await get().fetchById(sel.ID); // чтобы точно получить нормализованные позиции
  },

  moveBlockDown: async (blockId) => {
    const sel = get().selected;
    if (!sel?.blocks?.length) return;

    const blocks = sortBlocks(sel.blocks);
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx < 0 || idx >= blocks.length - 1) return;

    const current = blocks[idx];
    const next = blocks[idx + 1];

    await get().updateBlock(current.id, {
      lessonID: sel.ID,
      position: next.position,
    });
    await get().fetchById(sel.ID);
  },
}));
