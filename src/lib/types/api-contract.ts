/**
 * Mandatory API response contract.
 * All API routes must return this structure.
 */

export type ApiStatus =
  | "ok"
  | "created"
  | "error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation_error";

export type ApiResponse<T = unknown> = {
  success: boolean;
  status: ApiStatus;
  message: string;
  data: T | null;
};

export function status_from_http(status_code: number): ApiStatus {
  if (status_code >= 200 && status_code < 300)
    return status_code === 201 ? "created" : "ok";
  if (status_code === 401) return "unauthorized";
  if (status_code === 403) return "forbidden";
  if (status_code === 404) return "not_found";
  if (status_code === 400 || status_code === 422) return "validation_error";
  return "error";
}
