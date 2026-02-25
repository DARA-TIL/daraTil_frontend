import { create } from "zustand";
import axios from "axios";
import TestService from "../api/TestService";
import type { CreateTestDto, Test, UpdateTestDto } from "../model/types";
import { useUiStore } from "@/shared/store/useUiStore";

function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const backendError = (e.response?.data as any)?.error;
    if (backendError) return String(backendError);
  }
  return "Something went wrong. Please try again.";
}

type State = {
  test: Test | null;
  loading: boolean;

  // локальные изменения для bulk update
  draft: UpdateTestDto | null;

  fetchByLesson: (lessonId: number) => Promise<void>;
  createForLesson: (lessonId: number) => Promise<boolean>;
  deleteTest: (testId: number, lessonId: number) => Promise<boolean>;

  addQuestion: (
    lessonId: number,
    payload: { testId: number; text: string },
  ) => Promise<boolean>;
  deleteQuestion: (lessonId: number, questionId: number) => Promise<boolean>;

  addOption: (
    lessonId: number,
    payload: { questionId: number; text: string; isCorrect: boolean },
  ) => Promise<boolean>;
  updateOption: (
    lessonId: number,
    payload: { id: number; text: string; isCorrect: boolean },
  ) => Promise<boolean>;
  deleteOption: (lessonId: number, optionId: number) => Promise<boolean>;

  // draft helpers
  setDraftQuestionText: (questionId: number, text: string) => void;
  setDraftOption: (
    questionId: number,
    optionId: number,
    patch: { text?: string; isCorrect?: boolean },
  ) => void;
  clearDraft: () => void;

  saveDraft: () => Promise<boolean>;
};

export const useTestAdminStore = create<State>((set, get) => ({
  test: null,
  loading: false,
  draft: null,

  fetchByLesson: async (lessonId) => {
    set({ loading: true });
    try {
      const t = await TestService.getByLessonId(lessonId);
      set({ test: t, draft: null });
    } catch {
      // если теста нет - это не ошибка для UI
      set({ test: null, draft: null });
    } finally {
      set({ loading: false });
    }
  },

  createForLesson: async (lessonId) => {
    set({ loading: true });
    try {
      const payload: CreateTestDto = { lessonId, questions: [] };
      await TestService.create(payload);
      await get().fetchByLesson(lessonId);
      useUiStore.getState().showSnackbar("Test created", "success");
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteTest: async (testId) => {
    set({ loading: true });
    try {
      await TestService.delete(testId);
      set({ test: null, draft: null });
      useUiStore.getState().showSnackbar("Test deleted", "success");
      // lessonId оставляем на будущее, вдруг захочешь refetch
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  addQuestion: async (lessonId, payload) => {
    set({ loading: true });
    try {
      await TestService.createQuestion({
        testId: payload.testId,
        text: payload.text,
        options: [],
      });
      await get().fetchByLesson(lessonId);
      useUiStore.getState().showSnackbar("Question added", "success");
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteQuestion: async (lessonId, questionId) => {
    set({ loading: true });
    try {
      await TestService.deleteQuestion(questionId);
      await get().fetchByLesson(lessonId);
      useUiStore.getState().showSnackbar("Question deleted", "success");
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  addOption: async (lessonId, payload) => {
    set({ loading: true });
    try {
      await TestService.createOption(payload);
      await get().fetchByLesson(lessonId);
      useUiStore.getState().showSnackbar("Option added", "success");
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateOption: async (lessonId, payload) => {
    set({ loading: true });
    try {
      await TestService.updateOption(payload);
      await get().fetchByLesson(lessonId);
      useUiStore.getState().showSnackbar("Option saved", "success");
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteOption: async (lessonId, optionId) => {
    set({ loading: true });
    try {
      await TestService.deleteOption(optionId);
      await get().fetchByLesson(lessonId);
      useUiStore.getState().showSnackbar("Option deleted", "success");
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  clearDraft: () => set({ draft: null }),

  setDraftQuestionText: (questionId, text) => {
    const { test, draft } = get();
    if (!test) return;

    const base: UpdateTestDto =
      draft ??
      ({
        id: test.id,
        questionsUpd: [],
      } as UpdateTestDto);

    const existing = base.questionsUpd.find((q) => q.id === questionId);
    if (existing) {
      existing.text = text;
    } else {
      base.questionsUpd.push({ id: questionId, text, questionOptionsUpd: [] });
    }

    set({ draft: { ...base, questionsUpd: [...base.questionsUpd] } });
  },

  setDraftOption: (questionId, optionId, patch) => {
    const { test, draft } = get();
    if (!test) return;

    const base: UpdateTestDto =
      draft ??
      ({
        id: test.id,
        questionsUpd: [],
      } as UpdateTestDto);

    let q = base.questionsUpd.find((x) => x.id === questionId);
    if (!q) {
      q = { id: questionId, questionOptionsUpd: [] };
      base.questionsUpd.push(q);
    }

    q.questionOptionsUpd = q.questionOptionsUpd ?? [];
    const existing = q.questionOptionsUpd.find((o) => o.id === optionId);
    if (existing) {
      Object.assign(existing, patch);
    } else {
      q.questionOptionsUpd.push({ id: optionId, ...patch });
    }

    set({ draft: { ...base, questionsUpd: [...base.questionsUpd] } });
  },

  saveDraft: async () => {
    const { draft, test } = get();
    if (!draft || !test) return true;

    set({ loading: true });
    try {
      await TestService.update(draft);
      useUiStore.getState().showSnackbar("Test updated", "success");
      // перезагрузим реальный state
      const t = await TestService.getById(test.id);
      set({ test: t, draft: null });
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
