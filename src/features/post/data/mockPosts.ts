import { Post, Comment } from '../types/post.types';

// Mock images - replace with actual image imports or URIs
const mockImages = [
  require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
  require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
  require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
  require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
  require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
];

export const mockPostDetail: Post = {
  id: '1',
  author: {
    id: 'user1',
    name: 'Nguyễn Văn A',
    avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
    username: 'nguyenvana',
  },
  community: 'Football Community',
  timestamp: '2 giờ trước',
  title: 'Trận đấu hôm qua thật tuyệt vời!',
  content: 'Chúng ta đã có một trận đấu rất hay với nhiều pha bóng đẹp. Cảm ơn tất cả các bạn đã tham gia và cổ vũ nhiệt tình. Hẹn gặp lại ở trận tiếp theo!',
  media: [
        { type: 'image', source: { uri: 'https://res.cloudinary.com/deewfn3zq/image/upload/v1758543909/cafes/018b3971f82947db88e71f187d2b9f0c/ezvyqwywplzkj0ze6vcp.png' } },
        { type: 'image', source: { uri: 'https://res.cloudinary.com/deewfn3zq/image/upload/v1758543909/cafes/018b3971f82947db88e71f187d2b9f0c/ezvyqwywplzkj0ze6vcp.png' } },
        { type: 'image', source: { uri: 'https://res.cloudinary.com/deewfn3zq/image/upload/v1758543909/cafes/018b3971f82947db88e71f187d2b9f0c/ezvyqwywplzkj0ze6vcp.png' } },
        { type: 'video', source: 'https://res.cloudinary.com/deewfn3zq/video/upload/v1758543915/cafes/018b3971f82947db88e71f187d2b9f0c/t0oxnzxjrzqxqoc6btvi.mp4', thumbnail: { uri: 'YOUR_CLOUDINARY_VIDEO_THUMBNAIL_URL' } },
      ],
  type: 'match',
  likes: 125,
  comments: 23,
  shares: 8,
  isLiked: false,
};

export const mockComments: Comment[] = [
  {
    id: 'comment1',
    postId: '1',
    author: {
      id: 'user2',
      name: 'Trần Văn B',
      avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
      username: 'tranvanb',
    },
    content: 'Trận đấu này thật sự rất hay! Pha bóng ở phút thứ 45 thật tuyệt vời.',
    likes: 12,
    isLiked: false,
    timestamp: '1 giờ trước',
    replies: [
      {
        id: 'reply1',
        commentId: 'comment1',
        author: {
          id: 'user1',
          name: 'Nguyễn Văn A',
          avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
          username: 'nguyenvana',
        },
        content: 'Cảm ơn bạn đã cổ vũ!',
        likes: 3,
        isLiked: false,
        timestamp: '50 phút trước',
      },
      {
        id: 'reply2',
        commentId: 'comment1',
        author: {
          id: 'user3',
          name: 'Lê Văn C',
          avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
          username: 'levanc',
        },
        content: 'Đúng rồi, pha đó thật xuất sắc!',
        likes: 5,
        isLiked: true,
        timestamp: '45 phút trước',
        replyTo: {
          id: 'user1',
          name: 'Nguyễn Văn A',
          username: 'nguyenvana',
        },
      },
    ],
  },
  {
    id: 'comment2',
    postId: '1',
    author: {
      id: 'user4',
      name: 'Phạm Văn D',
      avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
      username: 'phamvand',
    },
    content: 'Khi nào có trận tiếp theo vậy? Tôi rất muốn tham gia!',
    likes: 8,
    isLiked: false,
    timestamp: '30 phút trước',
    replies: [],
  },
  {
    id: 'comment3',
    postId: '1',
    author: {
      id: 'user5',
      name: 'Hoàng Văn E',
      avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
      username: 'hoangvane',
    },
    content: 'Những bức ảnh này chụp đẹp quá! Có thể chia sẻ thêm một số bức nữa không?',
    likes: 15,
    isLiked: true,
    timestamp: '15 phút trước',
    replies: [
      {
        id: 'reply3',
        commentId: 'comment3',
        author: {
          id: 'user1',
          name: 'Nguyễn Văn A',
          avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
          username: 'nguyenvana',
        },
        content: 'Chắc chắn rồi! Tôi sẽ đăng thêm sau.',
        likes: 2,
        isLiked: false,
        timestamp: '10 phút trước',
      },
    ],
  },
];

