import axios from "axios";
import { getRecord, isRecord } from "./unknownRecord";

export function getApiErrorMessage(error: unknown): string | null {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (!isRecord(data)) return null;

    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
    const nestedData = getRecord(data, "data");
    if (typeof nestedData?.error === "string") return nestedData.error;
    if (typeof nestedData?.message === "string") return nestedData.message;
    if (typeof data.details === "string") return data.details;
  }
  if (error instanceof Error && error.message) return error.message;
  return null;
}
