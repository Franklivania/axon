import type { ApiResponse } from "@/lib/types/api-contract";

const get_base_url = (): string => {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
};

type FetchConfig = {
  base_url: string;
  credentials: RequestCredentials;
  locale?: string;
};

let _config: FetchConfig | null = null;

export function setup(options?: { locale?: string }): void {
  _config = {
    base_url: get_base_url(),
    credentials: "include",
    locale: options?.locale,
  };
}

function get_config(): FetchConfig {
  if (!_config) {
    _config = {
      base_url: get_base_url(),
      credentials: "include",
    };
  }
  return _config;
}

function build_headers(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set("Content-Type", "application/json");
  const cfg = get_config();
  if (cfg.locale) headers.set("x-locale", cfg.locale);
  return headers;
}

async function parse_response<T>(response: Response): Promise<T> {
  let json: ApiResponse<T>;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    const error = new Error(response.statusText || "Request failed") as Error & { status?: string; code?: number };
    error.code = response.status;
    throw error;
  }
  if (!json.success) {
    const error = new Error(json.message ?? "Request failed") as Error & { status?: string; code?: number };
    error.status = json.status;
    error.code = response.status;
    throw error;
  }
  return (json.data ?? null) as T;
}

export async function getData<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = get_config();
  const url = path.startsWith("http") ? path : `${cfg.base_url}${path.startsWith("/") ? "" : "/"}${path}`;
  const response = await fetch(url, {
    ...init,
    method: "GET",
    credentials: cfg.credentials,
    headers: build_headers(init?.headers),
  });
  return parse_response<T>(response);
}

export async function postData<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const cfg = get_config();
  const url = path.startsWith("http") ? path : `${cfg.base_url}${path.startsWith("/") ? "" : "/"}${path}`;
  const response = await fetch(url, {
    ...init,
    method: "POST",
    credentials: cfg.credentials,
    headers: build_headers(init?.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parse_response<T>(response);
}

export async function patchData<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const cfg = get_config();
  const url = path.startsWith("http") ? path : `${cfg.base_url}${path.startsWith("/") ? "" : "/"}${path}`;
  const response = await fetch(url, {
    ...init,
    method: "PATCH",
    credentials: cfg.credentials,
    headers: build_headers(init?.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parse_response<T>(response);
}

export async function updateData<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const cfg = get_config();
  const url = path.startsWith("http") ? path : `${cfg.base_url}${path.startsWith("/") ? "" : "/"}${path}`;
  const response = await fetch(url, {
    ...init,
    method: "PUT",
    credentials: cfg.credentials,
    headers: build_headers(init?.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parse_response<T>(response);
}

export async function deleteData<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = get_config();
  const url = path.startsWith("http") ? path : `${cfg.base_url}${path.startsWith("/") ? "" : "/"}${path}`;
  const response = await fetch(url, {
    ...init,
    method: "DELETE",
    credentials: cfg.credentials,
    headers: build_headers(init?.headers),
  });
  return parse_response<T>(response);
}

export async function multipartData<T>(path: string, form: FormData, init?: RequestInit): Promise<T> {
  const cfg = get_config();
  const url = path.startsWith("http") ? path : `${cfg.base_url}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init?.headers);
  if (cfg.locale) headers.set("x-locale", cfg.locale);
  const response = await fetch(url, {
    ...init,
    method: "POST",
    credentials: cfg.credentials,
    headers,
    body: form,
  });
  return parse_response<T>(response);
}
