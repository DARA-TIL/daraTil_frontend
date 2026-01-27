import $api from "@/shared/api/http";
import type { Lesson } from "../model/types";
import {
  normalizeLesson,
  unwrapLessonListPayload,
  unwrapLessonPayload,
} from "../model/normalize";

export default class LessonsService {
  static async getAll(): Promise<Lesson[]> {
    const res = await $api.get("/lesson/getAll");
    const list = unwrapLessonListPayload(res.data);
    return list.map(normalizeLesson).filter((x) => x.ID > 0);
  }

  static async getById(id: number): Promise<Lesson> {
    const res = await $api.get(`/lesson/getById/${id}`);
    return normalizeLesson(unwrapLessonPayload(res.data));
  }
}
