import $api from "@/shared/api/http";
import type {
  CreateOptionDto,
  CreateQuestionDto,
  CreateTestDto,
  Test,
  UpdateTestDto,
} from "../model/types";
import axios from "axios";
import { unwrapApiData } from "@/shared/lib/unknownRecord";

const BASE = "/test";

async function unwrap<T>(payload: unknown): Promise<T> {
  return unwrapApiData(payload) as T;
}

const TestService = {
  async getById(id: number): Promise<Test> {
    const res = await $api.get(`${BASE}/get/${id}`);
    return unwrap<Test>(res.data);
  },

  async getByLessonId(lessonId: number): Promise<Test | null> {
    try {
      const res = await $api.get(`${BASE}/lesson/${lessonId}`);
      return unwrap<Test>(res.data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        return null;
      }
      throw e;
    }
  },

  async create(payload: CreateTestDto): Promise<Test> {
    const res = await $api.post<Test>(`${BASE}/create`, payload);
    return unwrap<Test>(res.data);
  },

  async update(payload: UpdateTestDto): Promise<void> {
    await $api.put(`${BASE}/update`, payload);
  },

  async delete(id: number): Promise<void> {
    await $api.delete(`${BASE}/delete/${id}`);
  },

  async createQuestion(payload: CreateQuestionDto): Promise<void> {
    await $api.post(`${BASE}/question/create`, payload);
  },

  async deleteQuestion(id: number): Promise<void> {
    await $api.delete(`${BASE}/question/delete/${id}`);
  },

  async createOption(payload: CreateOptionDto): Promise<void> {
    await $api.post(`${BASE}/option/create`, payload);
  },

  async updateOption(payload: {
    id: number;
    text: string;
    isCorrect: boolean;
  }): Promise<void> {
    await $api.put(`${BASE}/option/update`, payload);
  },

  async deleteOption(id: number): Promise<void> {
    await $api.delete(`${BASE}/option/delete/${id}`);
  },
};

export default TestService;
