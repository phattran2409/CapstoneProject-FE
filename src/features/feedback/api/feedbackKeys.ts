import type {
    GetFeedbacksQuery,
} from "./feedbackApi";

export const feedbackKeys = {
  all: ["feedback"] as const,
  received: (query?: GetFeedbacksQuery) =>
    query != null
      ? ([...feedbackKeys.all, "received", query] as const)
      : ([...feedbackKeys.all, "received"] as const),
  given: (query?: GetFeedbacksQuery) =>
    query != null
      ? ([...feedbackKeys.all, "given", query] as const)
      : ([...feedbackKeys.all, "given"] as const),
};