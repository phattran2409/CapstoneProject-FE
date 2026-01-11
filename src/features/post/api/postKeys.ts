export const postKeys = {
  all: ['posts'] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
  comments: (postId: string) => [...postKeys.all, 'comments', postId] as const,
};

