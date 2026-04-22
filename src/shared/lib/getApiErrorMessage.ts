import axios from "axios";

export function getApiErrorMessage(error: unknown): string | null {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as any;
    if (typeof data === "string") return data;
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
    if (typeof data.data?.error === "string") return data.data.error;
    if (typeof data.data?.message === "string") return data.data.message;
    if (typeof data.details === "string") return data.details;
  }
  if (error instanceof Error && error.message) return error.message;
  return null;
}
