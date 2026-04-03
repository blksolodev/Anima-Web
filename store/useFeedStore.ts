import { create } from 'zustand';
import { DocumentSnapshot } from 'firebase/firestore';
import { Post, PostAuthor, User } from '../types';
import {
  subscribeFeed,
  loadMorePosts,
  createPost,
  likePost,
  unlikePost,
  repostPost,
  unrepostPost,
  deletePost,
  hydrateIsLiked,
  hydrateIsReposted,
  CreatePostOptions,
} from '../services/feed.service';
import { createNotification } from '../services/notification.service';

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
  repostPost: (postId: string, userId: string, currentUser?: User, post?: Post) => void;
  deletePost: (postId: string, authorId: string) => Promise<void>;
  removePost: (postId: string) => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  loading: true,
  hasMore: true,
  error: null,
  lastDoc: null,
  _unsubscribe: null,

  subscribe: (userId: string) => {
    // Clean up any existing subscription and reset posts so isLiked/isReposted
    // flags are not carried over when switching users (including guest → user).
    get()._unsubscribe?.();

    set({ loading: true, error: null, posts: [], lastDoc: null });

    const unsub = subscribeFeed(
      async (rawPosts) => {
        const existingMap = new Map(get().posts.map((p) => [p.id, p]));

        // Only hydrate posts we haven't seen before — preserves optimistic
        // isLiked / isReposted state and avoids the race where the listener
        // fires before the subcollection write has committed.
        const unseen = rawPosts.filter((p) => !existingMap.has(p.id));
        let hydratedUnseen = unseen;
        if (unseen.length > 0 && userId) {
          const withLikes = await hydrateIsLiked(userId, unseen).catch(() => unseen);
          hydratedUnseen = await hydrateIsReposted(userId, withLikes).catch(() => withLikes);
        }
        const unseenMap = new Map(hydratedUnseen.map((p) => [p.id, p]));

        const posts = rawPosts.map((p) => {
          if (existingMap.has(p.id)) {
            // Keep current interaction flags — don't let the listener overwrite them
            const existing = existingMap.get(p.id)!;
            return { ...p, isLiked: existing.isLiked, isReposted: existing.isReposted };
          }
          return unseenMap.get(p.id) ?? p;
        });

        set({ posts, loading: false, lastDoc: null });
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

  deletePost: async (postId, authorId) => {
    set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) }));
    await deletePost(postId, authorId).catch(() => {});
  },

  removePost: (postId) => {
    set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) }));
  },

  repostPost: (postId, userId, currentUser, postArg) => {
    // Always read isReposted from live store state — postArg can be a stale
    // React closure and would cause double-reposts if read directly.
    const storePost = get().posts.find((p) => p.id === postId);
    const post = storePost ?? postArg; // postArg used only as fallback for author info
    if (!post) return;

    const wasReposted = storePost?.isReposted ?? false;
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId
          ? { ...p, isReposted: !wasReposted, reposts: p.reposts + (wasReposted ? -1 : 1) }
          : p
      ),
    }));

    const op = wasReposted ? unrepostPost : repostPost;
    op(postId, userId).then(() => {
      // Fire repost notification (skip undo / skip own posts)
      if (!wasReposted && currentUser && post.authorId !== userId) {
        createNotification({
          type: 'repost',
          fromUserId: userId,
          fromUser: {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl,
          },
          targetUserId: post.authorId,
          relatedPostId: postId,
        }).catch(() => {});
      }
    }).catch(() => {
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
