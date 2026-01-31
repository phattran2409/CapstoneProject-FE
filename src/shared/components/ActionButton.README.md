# ActionButton Component

## Overview

The `ActionButton` component is a reusable UI component for posts and comments that provides edit and delete functionality with built-in validation and confirmation alerts.

## Features

- ✅ Edit and Delete actions with a 3-dot menu
- ✅ Content validation (required, max 5000 characters)
- ✅ Confirmation alert before deletion
- ✅ Loading states during async operations
- ✅ Internationalization support (i18n)
- ✅ Theme-aware styling
- ✅ Works with both posts and comments

## Usage

### For Posts

```tsx
import { ActionButton } from "@/shared/components";
import {
  useUpdatePost,
  useDeletePost,
} from "@/features/post/hooks/useMutationPost";
import { useAuthStore } from "@/shared/store/authStore";

const PostItem = ({ post }) => {
  const { user } = useAuthStore();
  const { mutateAsync: updatePost } = useUpdatePost();
  const { mutateAsync: deletePost } = useDeletePost();

  // Only show action button if the post belongs to the current user
  const isOwnPost = post.userId === user?.userId;

  const handleEditPost = async (postId: string, newContent: string) => {
    await updatePost({ postId, content: newContent });
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  return (
    <View>
      {/* Post Header */}
      <View style={styles.header}>
        <Text>{post.userFullName}</Text>

        {/* Show action button only for own posts */}
        {isOwnPost && (
          <ActionButton
            contentType="post"
            contentId={post.postId}
            currentContent={post.content}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        )}
      </View>

      {/* Post Content */}
      <Text>{post.content}</Text>
    </View>
  );
};
```

### For Comments

```tsx
import { ActionButton } from "@/shared/components";
import {
  useUpdateComment,
  useDeleteComment,
} from "@/features/post/hooks/useMutationComment";
import { useAuthStore } from "@/shared/store/authStore";

const CommentItem = ({ comment }) => {
  const { user } = useAuthStore();
  const { mutateAsync: updateComment } = useUpdateComment();
  const { mutateAsync: deleteComment } = useDeleteComment();

  // Only show action button if the comment belongs to the current user
  const isOwnComment = comment.userId === user?.userId;

  const handleEditComment = async (commentId: string, newContent: string) => {
    await updateComment({ commentId, content: newContent });
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  return (
    <View>
      {/* Comment Header */}
      <View style={styles.header}>
        <Text>{comment.userFullName}</Text>

        {/* Show action button only for own comments */}
        {isOwnComment && (
          <ActionButton
            contentType="comment"
            contentId={comment.commentId}
            currentContent={comment.content}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
          />
        )}
      </View>

      {/* Comment Content */}
      <Text>{comment.content}</Text>
    </View>
  );
};
```

## Props

| Prop             | Type                                                     | Required | Description                              |
| ---------------- | -------------------------------------------------------- | -------- | ---------------------------------------- |
| `contentType`    | `'post' \| 'comment'`                                    | Yes      | Type of content being edited/deleted     |
| `contentId`      | `string`                                                 | Yes      | Unique identifier of the post or comment |
| `currentContent` | `string`                                                 | Yes      | Current text content to be edited        |
| `onEdit`         | `(id: string, content: string) => void \| Promise<void>` | Yes      | Callback when edit is confirmed          |
| `onDelete`       | `(id: string) => void \| Promise<void>`                  | Yes      | Callback when delete is confirmed        |
| `isLoading`      | `boolean`                                                | No       | Whether the action is currently loading  |
| `testID`         | `string`                                                 | No       | Test identifier for testing              |

## Validation Rules

The component includes built-in validation:

- ✅ Content cannot be empty (after trimming whitespace)
- ✅ Content cannot exceed 5000 characters
- ✅ Validation errors are displayed in real-time

## Internationalization

The component uses the following i18n keys:

### English (`en.ts`)

```typescript
actionButton: {
  post: "post",
  comment: "comment",
  edit: "Edit",
  delete: "Delete",
  save: "Save",
  editTitle: "Edit {{type}}",
  deleteConfirmTitle: "Delete {{type}}?",
  deleteConfirmMessage: "Are you sure you want to delete this {{type}}? This action cannot be undone.",
  contentPlaceholder: "Enter content...",
  validation: {
    required: "Content cannot be empty",
    tooLong: "Content cannot exceed 5000 characters",
    failed: "Failed to save changes. Please try again.",
  },
}
```

### Vietnamese (`vi.ts`)

```typescript
actionButton: {
  post: "bài viết",
  comment: "bình luận",
  edit: "Chỉnh sửa",
  delete: "Xóa",
  save: "Lưu",
  editTitle: "Chỉnh sửa {{type}}",
  deleteConfirmTitle: "Xóa {{type}}?",
  deleteConfirmMessage: "Bạn có chắc chắn muốn xóa {{type}} này? Hành động này không thể hoàn tác.",
  contentPlaceholder: "Nhập nội dung...",
  validation: {
    required: "Nội dung không được để trống",
    tooLong: "Nội dung không được vượt quá 5000 ký tự",
    failed: "Không thể lưu thay đổi. Vui lòng thử lại.",
  },
}
```

## Styling

The component is fully theme-aware and uses:

- `theme.colors.surface` - Background colors
- `theme.colors.text` - Primary text
- `theme.colors.textSecondary` - Secondary text
- `theme.colors.neonGreen` - Edit action color
- `theme.colors.error` - Delete action color
- `theme.colors.border` - Border colors

## Notes

- The component handles both synchronous and asynchronous callbacks
- Edit modal appears from bottom with slide animation
- Delete confirmation uses danger alert style
- All modals have proper backdrop dismissal
- Loading states prevent multiple submissions
- Character counter shows remaining characters (5000 max)
