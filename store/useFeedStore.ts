import { create } from 'zustand';
import { DocumentSnapshot } from 'firebase/firestore';
import { Post, PostAuthor, MediaAttachment, AnimeReference } from '../types';
import {
  subscribeFeed,
  loadMorePosts,
  createPost,
  likePost,
  unlikePost,
  repostPost,
  unrepostPost,
  hydrateIsLiked,
  CreatePostOptions,
} from '../services/feed.service';

interface FeedState {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  lastDoc: DocumentSnapshot | null;
  _unsubscribe: (() => void) | null;

  // Actions
  subscribe: (userId: string) => void;
  unsubscribe: () => void;
  loadMore: () => Promise<void>;
  createPost: (content: string, author: PostAuthor, options?: CreatePostOptions) => Promise<string>;
  likePost: (postId: string, userId: string) => void;
  repostPost: (postId: string, userId: string) => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  loading: true,
  hasMore: true,
  error: null,
  lastDoc: null,
  _unsubscribe: null,

  subscribe: (userId: string) => {
    // Clean up any existing subscription
    get()._unsubscribe?.();

    set({ loading: true, error: null });

    const unsub = subscribeFeed(
      async (rawPosts) => {
        const posts = await hydrateIsLiked(userId, rawPosts).catch(() => rawPosts);
        set({
          posts,
          loading: false,
          lastDoc: null, // reset pagination on fresh data
        });
      },
      (err) => {
        console.error('[Feed] subscription error:', err);
        set({ error: 'Failed to load feed.', loading: false });
      }
    );

    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    get()._unsubscribe?.();
    set({ _unsubscribe: null });
  },

  loadMore: async () => {
    const { lastDoc, posts, hasMore, loading } = get();
    if (!hasMore || loading || !lastDoc) return;

    set({ loading: true });
    try {
      const { posts: more, lastDoc: newLast } = await loadMorePosts(lastDoc);
      set({
        posts: [...posts, ...more],
        lastDoc: newLast,
        hasMore: more.length > 0,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  createPost: async (content, author, options = {}) => {
    const id = await createPost(content, author, options);
    // Optimistically prepend (real-time listener will confirm)
    const optimistic: Post = {
      id,
      authorId: author.id,
      author,
      content,
      likes: 0,
      reposts: 0,
      replies: 0,
      isLiked: false,
      isReposted: false,
      isSpoiler: options.isSpoiler ?? false,
      isMature: options.isMature ?? false,
      mediaAttachment: options.mediaAttachment,
      animeReference: options.animeReference,
      createdAt: new Date(),
    };
    set((s) => ({ posts: [optimistic, ...s.posts] }));
    return id;
  },

  likePost: (postId, userId) => {
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;

    const wasLiked = post.isLiked ?? false;
    // Optimistic update
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !wasLiked, likes: p.likes + (wasLiked ? -1 : 1) }
          : p
      ),
    }));

    const op = wasLiked ? unlikePost : likePost;
    op(postId, userId).catch(() => {
      // Revert on error
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: wasLiked, likes: p.likes + (wasLiked ? 1 : -1) }
            : p
        ),
      }));
    });
  },

  repostPost: (postId, userId) => {
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;

    const wasReposted = post.isReposted ?? false;
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId
          ? { ...p, isReposted: !wasReposted, reposts: p.reposts + (wasReposted ? -1 : 1) }
          : p
      ),
    }));

    const op = wasReposted ? unrepostPost : repostPost;
    op(postId, userId).catch(() => {
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId
            ? { ...p, isReposted: wasReposted, reposts: p.reposts + (wasReposted ? 1 : -1) }
            : p
        ),
      }));
    });
  },
}));
