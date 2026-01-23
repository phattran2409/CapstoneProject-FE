export const postKeys = {
  all: ['posts'] as const,
  list: () => [...postKeys.all, 'list'] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
  postsByUserId: (userId: string) => [...postKeys.all, 'postsByUserId', userId] as const,
  comments: (postId: string) => [...postKeys.all, 'comments', postId] as const,
};

