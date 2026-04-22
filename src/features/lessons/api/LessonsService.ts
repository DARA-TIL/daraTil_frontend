import $api from "@/shared/api/http";
import type {
  FinishLessonRequest,
  FinishLessonResponse,
  Lesson,
} from "../model/types";
import {
  normalizeLesson,
  unwrapLessonListPayload,
  unwrapLessonPayload,
} from "../model/normalize";
import axios from "axios";
import { isRecord } from "@/shared/lib/unknownRecord";

export default class LessonsService {
  static async getAll(): Promise<Lesson[]> {
    const res = await $api.get("/lesson/getAll");
    const list = unwrapLessonListPayload(res.data);
    return list.map(normalizeLesson).filter((x) => x.ID > 0);
  }

  static async getById(id: number): Promise<Lesson> {
    try {
      const res = await $api.get(`/lesson/getById/${id}`);
      return normalizeLesson(unwrapLessonPayload(res.data));
    } catch (e) {
      // 423 Locked - уровень ниже requiredLevel
      if (axios.isAxiosError(e) && e.response?.status === 423) {
        const err = new Error("locked") as Error & { code: number };
        err.code = 423;
        throw err;
      }
      throw e;
    }
  }

  static async finish(
    payload: FinishLessonRequest,
  ): Promise<FinishLessonResponse> {
    const res = await $api.post<unknown>("/lesson/finish", payload);
    const raw = res.data;
    const root = isRecord(raw) ? raw : {};
    const data = isRecord(root.data) ? root.data : null;

    // Новый формат бэка:
    // { data: { lessonResult: {...}, progress: {...}, streak: "NoChange" } }
    if (data?.lessonResult) {
      return {
        data: data.lessonResult,
        progress: data.progress,
        streak: typeof data.streak === "string" ? data.streak : undefined,
      } as FinishLessonResponse;
    }

    // На всякий случай: если когда-то вернется "двойной envelope"
    // { data: { data: {...}, progress, streak } }
    if (data?.data) {
      return {
        data: data.data,
        progress: data.progress ?? root.progress,
        streak:
          typeof data.streak === "string"
            ? data.streak
            : typeof root.streak === "string"
              ? root.streak
              : undefined,
      } as FinishLessonResponse;
    }

    // Legacy: уже "нормальный" ответ
    return raw as FinishLessonResponse;
  }
}
