import MediaPost, { MediaPostProps } from "@/entities/MediaPost";
import { FC, useState, useRef, useEffect, useCallback } from "react";
import "./index.scss";

const MediaFeed: FC = () => {
  const [posts, setPosts] = useState<MediaPostProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement>(null);

  // Cache control
  const cache = useRef<Map<number, MediaPostProps[]>>(new Map());
  const POSTS_PER_PAGE = 6;

  // Debounce function to prevent multiple rapid fetch calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Simulate fetching posts with improved error handling
  const fetchPosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    // Check cache first
    if (cache.current.has(page)) {
      setPosts((prev) => [...prev, ...cache.current.get(page)!]);
      setPage((prev) => prev + 1);
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, replace this with actual API call
      // e.g., const response = await fetch(`/api/posts?page=${page}&limit=${POSTS_PER_PAGE}`);

      // Simulate network request
      await new Promise((resolve) =>
        setTimeout(resolve, 800 + Math.random() * 400),
      );

      // Simulate API response
      const newPosts = Array.from({ length: POSTS_PER_PAGE }, (_, i) => ({
        id: `post-${(page - 1) * POSTS_PER_PAGE + i + 1}`,
        username: `User${Math.floor(Math.random() * 100)}`,
        subtitle: `This is post content ${(page - 1) * POSTS_PER_PAGE + i + 1} with some random text ${Math.random().toString(36).substring(2, 15)}`,
        timestamp: `${Math.floor(Math.random() * 60)} min ago`,
        imageSrc: `https://picsum.photos/seed/${(page - 1) * POSTS_PER_PAGE + i + 1}/500/500`,
        position: (page - 1) * POSTS_PER_PAGE + i + 1,
        total: -1, // Unknown total for infinite scroll
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
      }));

      // Simulate end of available data after 10 pages
      if (page >= 10) {
        setHasMore(false);
      }

      // Cache the results
      cache.current.set(page, newPosts);

      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page]);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Advanced infinite scroll with Intersection Observer
  useEffect(() => {
    if (!lastPostRef.current || isLoading || !hasMore) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with optimized options
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Use debounce to prevent multiple rapid fetch calls
          debounce(fetchPosts, 200)();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px", // Preload before user reaches the end
      },
    );

    observerRef.current.observe(lastPostRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchPosts, isLoading, hasMore]);

  // Keyboard navigation with improved focus management
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const focusedElement = document.activeElement;
      const articles = feedRef.current?.querySelectorAll("article");
      if (!articles || !focusedElement) return;

      const currentIndex = Array.from(articles).indexOf(
        focusedElement.closest("article")!,
      );

      const isInsideFeed = feedRef.current?.contains(focusedElement);
      if (!isInsideFeed) return;

      switch (true) {
        case e.key === "PageDown" && currentIndex < articles.length - 1:
          e.preventDefault();
          (articles[currentIndex + 1] as HTMLElement).focus();

          // If we're approaching the end, trigger loading more posts
          if (currentIndex >= articles.length - 3 && hasMore && !isLoading) {
            fetchPosts();
          }
          break;

        case e.key === "PageUp" && currentIndex > 0:
          e.preventDefault();
          (articles[currentIndex - 1] as HTMLElement).focus();
          break;

        case e.key === "End":
          e.preventDefault();
          (articles[articles.length - 1] as HTMLElement).focus();
          // Load more if we're at the end
          if (hasMore && !isLoading) {
            fetchPosts();
          }
          break;

        case e.key === "Home":
          e.preventDefault();
          (articles[0] as HTMLElement).focus();
          break;

        case e.ctrlKey && e.key === "End":
          e.preventDefault();
          const nextFocusable =
            feedRef.current?.nextElementSibling?.querySelector(
              'a, button, input, [tabindex="0"]',
            ) as HTMLElement;
          nextFocusable?.focus();
          break;

        case e.ctrlKey && e.key === "Home":
          e.preventDefault();
          const prevFocusable =
            feedRef.current?.previousElementSibling?.querySelector(
              'a, button, input, [tabindex="0"]',
            ) as HTMLElement;
          prevFocusable?.focus();
          break;
      }
    },
    [fetchPosts, hasMore, isLoading],
  );

  // Manual refresh function
  const handleRefresh = () => {
    // Reset state
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);

    // Clear cache for fresh data
    cache.current.clear();

    // Fetch new posts
    fetchPosts();
  };

  // Scroll restoration on component mount
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("feedScrollPosition");
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
    }

    // Save scroll position when leaving
    return () => {
      sessionStorage.setItem("feedScrollPosition", window.scrollY.toString());
    };
  }, []);

  return (
    <>
      <div className="MediaFeed__controls">
        <button
          onClick={handleRefresh}
          className="MediaFeed__refresh-btn"
          aria-label="Refresh feed"
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>
      <section
        className="MediaFeed"
        ref={feedRef}
        role="feed"
        aria-label="Social Media Feed"
        onKeyDown={handleKeyDown}
        aria-busy={isLoading ? "true" : "false"}
        tabIndex={-1}
      >
        {posts.length === 0 && isLoading ? (
          <div className="MediaFeed__loading-initial">
            <p>Loading posts...</p>
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostRef : null}
                className="MediaFeed__post-wrapper"
              >
                <MediaPost {...post} />
              </div>
            ))}

            {error && (
              <div className="MediaFeed__error">
                <p>{error}</p>
                <button onClick={fetchPosts}>Try Again</button>
              </div>
            )}

            {isLoading && (
              <div className="MediaFeed__loading">
                <p>Loading more posts...</p>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="MediaFeed__end">
                <p>You've reached the end of the feed</p>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default MediaFeed;
