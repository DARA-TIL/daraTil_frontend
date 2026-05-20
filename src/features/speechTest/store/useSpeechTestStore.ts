import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { SpeechTestSessionService } from "../api/SpeechTestService";
import type {
  CheckPronounceResponse,
  SpeechPracticeStep,
  SpeechTest,
  SpeechTestSession,
  SpeechTestSessionResultResponse,
} from "../model/types";

type SpeechTestState = {
  session: SpeechTestSession | null;
  currentTest: SpeechTest | null;
  checkResult: CheckPronounceResponse | null;
  finalResult: SpeechTestSessionResultResponse | null;
  step: SpeechPracticeStep;
  loading: boolean;
  checking: boolean;
  ending: boolean;
  startSession: () => Promise<SpeechTestSession | null>;
  loadNextTest: () => Promise<SpeechTest | null>;
  setRecorded: () => void;
  resetRecordingState: () => void;
  checkPronounce: (audioFile: File | Blob) => Promise<CheckPronounceResponse | null>;
  endSession: () => Promise<SpeechTestSessionResultResponse | null>;
  reset: () => void;
};

function fallbackMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error) ?? fallback;
}

export const useSpeechTestStore = create<SpeechTestState>((set, get) => ({
  session: null,
  currentTest: null,
  checkResult: null,
  finalResult: null,
  step: "idle",
  loading: false,
  checking: false,
  ending: false,

  startSession: async () => {
    if (get().loading) return get().session;

    set({
      loading: true,
      finalResult: null,
      checkResult: null,
      step: "idle",
    });

    try {
      const session = await SpeechTestSessionService.startSession();
      set({
        session,
        step: session.is_ended ? "finished" : "ready",
      });

      if (!session.is_ended) {
        await get().loadNextTest();
      }

      return session;
    } catch (error) {
      useUiStore
        .getState()
        .showSnackbar(
          fallbackMessage(error, "Failed to start pronunciation practice"),
          "error",
        );
      set({ step: "idle" });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  loadNextTest: async () => {
    set({
      loading: true,
      currentTest: null,
      checkResult: null,
      step: "ready",
    });

    try {
      const test = await SpeechTestSessionService.getNextTest();
      set({
        currentTest: test,
        checkResult: null,
        step: "ready",
      });
      return test;
    } catch (error) {
      useUiStore
        .getState()
        .showSnackbar(
          fallbackMessage(error, "No pronunciation test is available right now"),
          "warning",
        );
      set({
        currentTest: null,
        step: get().session ? "ready" : "idle",
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setRecorded: () => set({ step: "recorded" }),

  resetRecordingState: () =>
    set((state) => ({
      checkResult: null,
      step: state.currentTest ? "ready" : state.step,
    })),

  checkPronounce: async (audioFile) => {
    const test = get().currentTest;
    if (!test) return null;
    const previousResult = get().checkResult;
    if (previousResult?.test.id === test.id) return previousResult;

    set({ checking: true, step: "checking" });
    try {
      const result = await SpeechTestSessionService.checkPronounce(
        test.id,
        audioFile,
      );
      set((state) => ({
        checkResult: result,
        currentTest: result.test,
        session: state.session
          ? {
              ...state.session,
              correct_count: result.is_correct
                ? state.session.correct_count + 1
                : state.session.correct_count,
              speech_tests: state.session.speech_tests.some(
                (item) => item.id === result.test.id,
              )
                ? state.session.speech_tests
                : [...state.session.speech_tests, result.test],
            }
          : state.session,
        step: "feedback",
      }));
      return result;
    } catch (error) {
      useUiStore
        .getState()
        .showSnackbar(
          fallbackMessage(error, "Failed to check pronunciation"),
          "error",
        );
      set({ step: "recorded" });
      return null;
    } finally {
      set({ checking: false });
    }
  },

  endSession: async () => {
    if (get().ending) return get().finalResult;

    set({ ending: true });
    try {
      const result = await SpeechTestSessionService.endSession();
      set({
        finalResult: result,
        session: result.session,
        step: "finished",
        currentTest: null,
        checkResult: null,
      });

      await useAuthStore.getState().checkAuth();
      return result;
    } catch (error) {
      useUiStore
        .getState()
        .showSnackbar(
          fallbackMessage(error, "Failed to finish pronunciation practice"),
          "error",
        );
      return null;
    } finally {
      set({ ending: false });
    }
  },

  reset: () =>
    set({
      session: null,
      currentTest: null,
      checkResult: null,
      finalResult: null,
      step: "idle",
      loading: false,
      checking: false,
      ending: false,
    }),
}));
