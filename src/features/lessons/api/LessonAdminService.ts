import $api from "@/shared/api/http";
import type {
  Lesson,
  LessonCreateDto,
  LessonUpdateDto,
  LessonBlock,
  LessonBlockCreateDto,
  LessonBlockUpdateDto,
} from "../model/types";

export default class LessonsAdminService {
  static async create(payload: LessonCreateDto): Promise<Lesson> {
    const res = await $api.post<Lesson>("/lesson/create", payload);
    return res.data;
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
    const res = await $api.post<LessonBlock>("/lesson/createBlock", payload);
    return res.data;
  }

  static async updateBlock(
    id: number,
    payload: LessonBlockUpdateDto,
  ): Promise<LessonBlock> {
    const res = await $api.patch<LessonBlock>(
      `/lesson/updateBlock/${id}`,
      payload,
    );
    return res.data;
  }

  static async deleteBlock(id: number): Promise<void> {
    await $api.delete(`/lesson/deleteBlock/${id}`);
  }
}
