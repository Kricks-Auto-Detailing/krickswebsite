import { getSquareEnv } from "./env";

type SquareRequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

type SquareError = {
  errors?: Array<{ code?: string; detail?: string }>;
};

export async function squareRequest<T>(path: string, options: SquareRequestOptions = {}): Promise<T> {
  const env = getSquareEnv();
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": env.version,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
    next: options.next,
  });

  const data = (await response.json().catch(() => ({}))) as T & SquareError;

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.detail ?? data.errors?.[0]?.code ?? `Square request failed: ${path}`);
  }

  return data;
}
