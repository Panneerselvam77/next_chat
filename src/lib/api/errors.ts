import axios from "axios";

export function getApiErrorMessage(
  data: unknown,
  fallback = "Something went wrong.",
): string {
  if (typeof data !== "object" || data === null) return fallback;

  if ("detail" in data) {
    const detail = data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) =>
          typeof item === "object" &&
          item !== null &&
          "msg" in item &&
          typeof item.msg === "string"
            ? item.msg
            : null,
        )
        .filter((message): message is string => message !== null);
      if (messages.length > 0) return messages.join(" ");
    }
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}

export function getApiRequestErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return getApiErrorMessage(error.response?.data, error.message || fallback);
  }

  return error instanceof Error ? error.message : fallback;
}
