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
        const err: any = new Error("locked");
        err.code = 423;
        throw err;
      }
      throw e;
    }
  }

  static async finish(
    payload: FinishLessonRequest,
  ): Promise<FinishLessonResponse> {
    const res = await $api.post<any>("/lesson/finish", payload);
    const raw = res.data;

    // Новый формат бэка:
    // { data: { lessonResult: {...}, progress: {...}, streak: "NoChange" } }
    if (raw?.data?.lessonResult) {
      return {
        data: raw.data.lessonResult,
        progress: raw.data.progress,
        streak: raw.data.streak,
      } as FinishLessonResponse;
    }

    // На всякий случай: если когда-то вернется "двойной envelope"
    // { data: { data: {...}, progress, streak } }
    if (raw?.data?.data) {
      return {
        data: raw.data.data,
        progress: raw.data.progress ?? raw.progress,
        streak: raw.data.streak ?? raw.streak,
      } as FinishLessonResponse;
    }

    // Legacy: уже "нормальный" ответ
    return raw as FinishLessonResponse;
  }
}
