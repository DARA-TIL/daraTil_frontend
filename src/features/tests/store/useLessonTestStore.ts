import { create } from "zustand";
import type { Test } from "../model/types";
import TestService from "../api/TestService";
import LessonsService from "@/features/lessons/api/LessonsService";
import type { FinishLessonResponse } from "@/features/lessons/model/types";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";

type State = {
  test: Test | null;
  loading: boolean;

  started: boolean;
  answers: Record<number, number>;

  submitting: boolean;
  finishResult: FinishLessonResponse | null;

  fetchByLesson: (lessonId: number) => Promise<void>;
  start: () => void;
  setAnswer: (questionId: number, optionId: number) => void;
  reset: () => void;

  submit: (lessonId: number) => Promise<void>;
};

function toBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "passed", "pass"].includes(s)) return true;
    if (["false", "0", "no", "failed", "fail"].includes(s)) return false;
  }
  return null;
}

// приводит ответ finish() к форме { data, progress, streak } даже если пришло { data: { data, progress, streak } }
function normalizeFinishResponse(raw: any): any {
  // если вдруг LessonsService.finish вернул AxiosResponse
  const maybe = raw?.data && raw?.status ? raw.data : raw;

  // 1) двойной envelope: { data: { data: X, progress: Y, streak: Z } }
  if (
    maybe?.data?.data &&
    (maybe?.data?.progress !== undefined || maybe?.data?.streak !== undefined)
  ) {
    return {
      ...maybe,
      data: maybe.data.data,
      progress: maybe.data.progress ?? maybe.progress,
      streak: maybe.data.streak ?? maybe.streak,
    };
  }

  // 2) обычный: { data: X, progress: Y, streak: Z }
  // 3) или уже X (если сервис распаковал) - тогда просто вернем как есть
  return maybe;
}

function extractPass(res: any): boolean {
  const d = res?.data;

  const cand =
    d?.pass ?? d?.Pass ?? d?.passed ?? d?.Passed ?? res?.pass ?? res?.Pass;

  const b = toBool(cand);
  if (b !== null) return b;

  // fallback: иногда pass лежит глубже
  const cand2 = d?.data?.pass ?? d?.data?.Pass;
  const b2 = toBool(cand2);
  if (b2 !== null) return b2;

  return false;
}

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

      const raw = await LessonsService.finish(payload);
      const resNorm = normalizeFinishResponse(raw);

      // IMPORTANT: finishResult должен быть в том виде, как его ждут UI компоненты
      set({ finishResult: resNorm as FinishLessonResponse });

      const passed = extractPass(resNorm);

      if (passed) {
        useUiStore.getState().showSnackbar("Lesson passed", "success");
        await useAuthStore.getState().checkAuth();
      } else {
        useUiStore.getState().showSnackbar("Test failed. Try again.", "error");
      }
    } catch (e) {
      const msg =
        getApiErrorMessage(e) ?? "Something went wrong. Please try again.";
      useUiStore.getState().showSnackbar(msg, "error");
    } finally {
      set({ submitting: false });
    }
  },
}));
