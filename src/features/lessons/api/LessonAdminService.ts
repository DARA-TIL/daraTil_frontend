import $api from "@/shared/api/http";
import type {
  Lesson,
  LessonCreateDto,
  LessonUpdateDto,
  LessonBlock,
  LessonBlockCreateDto,
  LessonBlockUpdateDto,
} from "../model/types";
import {
  normalizeLesson,
  normalizeLessonBlock,
  unwrapLessonPayload,
} from "../model/normalize";

type LessonBlockApiPayload = {
  name?: string;
  contentType?: string;
  contentUrl?: string | null;
  contentText?: string | null;
  lessonId?: number;
  lessonID?: number;
  position?: number;
};

export default class LessonsAdminService {
  static async create(payload: LessonCreateDto): Promise<Lesson> {
    const res = await $api.post("/lesson/create", payload);
    return normalizeLesson(unwrapLessonPayload(res.data));
  }

  static async update(id: number, payload: LessonUpdateDto): Promise<void> {
    await $api.patch(`/lesson/update/${id}`, payload);
  }

  static async remove(id: number): Promise<void> {
    await $api.delete(`/lesson/delete/${id}`);
  }

  static async createBlock(
    payload: LessonBlockCreateDto,
  ): Promise<LessonBlock> {
    // backend ожидает lessonId, contentType
    const body: LessonBlockApiPayload = {
      name: payload.name,
      contentType: payload.type,
      contentUrl: payload.contentUrl ?? "",
      contentText: payload.contentText ?? "",
      lessonId: payload.lessonID,
      position: payload.position,
    };
    const res = await $api.post("/lesson/createBlock", body);
    const raw = unwrapLessonPayload(res.data);
    return normalizeLessonBlock(raw);
  }

  static async updateBlock(
    id: number,
    payload: LessonBlockUpdateDto,
  ): Promise<LessonBlock> {
    const body: LessonBlockApiPayload = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.type !== undefined) body.contentType = payload.type;
    if (payload.contentUrl !== undefined) body.contentUrl = payload.contentUrl;
    if (payload.contentText !== undefined)
      body.contentText = payload.contentText;
    if (payload.position !== undefined) body.position = payload.position;
    if (payload.lessonID !== undefined) body.lessonID = payload.lessonID; // обязательно если меняется position

    const res = await $api.patch(`/lesson/updateBlock/${id}`, body);
    const raw = unwrapLessonPayload(res.data);
    return normalizeLessonBlock(raw);
  }

  static async deleteBlock(id: number): Promise<void> {
    await $api.delete(`/lesson/deleteBlock/${id}`);
  }
}
