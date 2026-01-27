import { create } from "zustand";
import LessonsService from "../api/LessonsService";
import type { Lesson } from "../model/types";

type State = {
  items: Lesson[];
  selected: Lesson | null;
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  clearSelected: () => void;
};

export const useLessonsStore = create<State>((set) => ({
  items: [],
  selected: null,
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await LessonsService.getAll();
      set({ items: data });
    } catch (e) {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchById: async (id) => {
    set({ loading: true });
    try {
      const lesson = await LessonsService.getById(id);
      set({ selected: lesson });
    } catch (e) {
      set({ selected: null });
    } finally {
      set({ loading: false });
    }
  },

  clearSelected: () => set({ selected: null }),
}));
