import type {
  GetReceivedFeedbacksQuery,
  GetGivenFeedbacksQuery,
} from "./feedbackApi";

export const feedbackKeys = {
  all: ["feedback"] as const,
  received: (query?: GetReceivedFeedbacksQuery) =>
    query != null
      ? ([...feedbackKeys.all, "received", query] as const)
      : ([...feedbackKeys.all, "received"] as const),
  given: (query?: GetGivenFeedbacksQuery) =>
    query != null
      ? ([...feedbackKeys.all, "given", query] as const)
      : ([...feedbackKeys.all, "given"] as const),
};
