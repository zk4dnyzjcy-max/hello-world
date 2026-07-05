"use client";

/**
 * Reads a fetch Response as JSON, but degrades gracefully when the server
 * returns something that isn't JSON (e.g. a 500 HTML error page or an empty
 * body). Browsers otherwise throw an opaque message like "The string did not
 * match the expected pattern" from Response.json(), which hides the real cause.
 */
export async function readJson<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();

  let data: unknown = null;
  let parseFailed = false;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      parseFailed = true;
    }
  }

  if (!res.ok) {
    const fromBody =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null;
    throw new Error(fromBody ?? `Request failed (${res.status} ${res.statusText}).`);
  }

  if (parseFailed) {
    throw new Error("The server returned an unexpected response. Please try again.");
  }

  return data as T;
}
