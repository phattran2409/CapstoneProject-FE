import { Friend, Players } from "@/features/friends/types/friends.types";
import { Post } from "@/features/post/types/post.types";
import { SearchResultItem } from "../types/search.types";

/**
 * Transform Friend data to SearchResultItem
 */
export const transformPlayersToSearchResult = (
  players: Players,
): SearchResultItem => {
  return {
    id: players.userId,
    type: "players",
    title: players.fullName, 
    subtitle: "Player",
    avatarUrl: players.avatarUrl,
    data: players,
  };
};  

/**
 * Transform Post data to SearchResultItem
 */

const DEFAULT_IMAGES = require("../../../assets/images/post-icon.jpg");

export const transformPostToSearchResult = (post: Post): SearchResultItem => {
  const firstImage = post.media?.find((m) => m.mediaType === 0);
  const imageSource = firstImage ? { uri: firstImage.publicUrl } : DEFAULT_IMAGES;

  const subtitle = post.content
    ? post.content.substring(0, 80) + (post.content.length > 80 ? "..." : "")
    : new Date(post.createdAt).toLocaleDateString();

  return {
    id: post.postId,
    type: "posts",
    title: post.userFullName || "Bài viết",
    subtitle,
    image: imageSource,
    avatarUrl: post.userAvatarUrl,
    data: post,
  };
};
