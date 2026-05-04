export const postKeys = {
  all: ["posts"] as const,
  list: () => [...postKeys.all, "list"] as const,
  listFiltered: (params: Record<string, unknown>) =>
    [...postKeys.list(), params] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
  postsByUserId: (userId: string) =>
    [...postKeys.all, "postsByUserId", userId] as const,
  comments: (postId: string) => [...postKeys.all, "comments", postId] as const,
  replies: (commentId: string) =>
    [...postKeys.all, "replies", commentId] as const,
  postLikes: (postId: string) =>
    [...postKeys.all, "likes", "post", postId] as const,
  commentLikes: (commentId: string) =>
    [...postKeys.all, "likes", "comment", commentId] as const,
};
