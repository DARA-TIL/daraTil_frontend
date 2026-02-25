import { create } from "zustand";
import type { Test } from "../model/types";
import TestService from "../api/TestService";
import LessonsService from "@/features/lessons/api/LessonsService";
import type { FinishLessonResponse } from "@/features/lessons/model/types";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

type State = {
  test: Test | null;
  loading: boolean;

  started: boolean;
  answers: Record<number, number>; // questionId -> optionId

  submitting: boolean;
  finishResult: FinishLessonResponse | null;

  fetchByLesson: (lessonId: number) => Promise<void>;
  start: () => void;
  setAnswer: (questionId: number, optionId: number) => void;
  reset: () => void;

  submit: (lessonId: number) => Promise<void>;
};

export const useLessonTestStore = create<State>((set, get) => ({
  test: null,
  loading: false,

  started: false,
  answers: {},

  submitting: false,
  finishResult: null,

  fetchByLesson: async (lessonId) => {
    set({ loading: true });
    try {
      const t = await TestService.getByLessonId(lessonId);
      set({ test: t });
    } catch {
      set({ test: null });
    } finally {
      set({ loading: false });
    }
  },

  start: () => set({ started: true, finishResult: null }),

  setAnswer: (questionId, optionId) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: optionId } })),

  reset: () =>
    set({
      started: false,
      answers: {},
      finishResult: null,
    }),

  submit: async (lessonId) => {
    const { test, answers } = get();
    if (!test) return;

    const total = test.questions?.length ?? 0;
    const answered = Object.keys(answers).length;
    if (total > 0 && answered < total) {
      useUiStore
        .getState()
        .showSnackbar("Answer all questions before submit", "warning");
      return;
    }

    set({ submitting: true });
    try {
      const payload = {
        testId: test.id,
        lessonId,
        userAns: Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [String(k), v]),
        ),
      };

      const res = await LessonsService.finish(payload);
      set({ finishResult: res });

      const passed = Boolean(res.data?.pass) || Boolean(res.progress);

      if (passed) {
        useUiStore.getState().showSnackbar("Lesson passed", "success");
        await useAuthStore.getState().checkAuth();
      } else {
        useUiStore.getState().showSnackbar("Test failed. Try again.", "error");
      }
    } finally {
      set({ submitting: false });
    }
  },
}));
