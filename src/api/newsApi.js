export const getCategories = async () => {
  try {
    const res = await fetch("https://dummyjson.com/posts/tags");
    const data = await res.json();
    return ["all", ...data.map(t => t.slug).slice(0, 15)]; // Limit to a clean 15 string tags
  } catch (error) {
    return ["all", "history", "magical", "fiction"];
  }
};

export const getNews = async (page = 1, searchQuery = "", category = "all") => {
  const limit = 9;
  const skip = (page - 1) * limit;
  let url = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}`;
  
  if (searchQuery) {
    url = `https://dummyjson.com/posts/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}&skip=${skip}`;
  } else if (category && category !== "all") {
    url = `https://dummyjson.com/posts/tag/${category}?limit=${limit}&skip=${skip}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch from public API");
    const data = await res.json();
    
    // Map DummyJSON posts into our universal App standard formatting
    const articles = data.posts.map((post) => ({
      id: `public-${post.id}`,
      title: post.title,
      // Create a nice looking mock body summary and the full body
      content: post.body,
      author: `User ${post.userId} (Public)`,
      category: post.tags[0] || "general",
      // Fake realistic dates descending from now
      timestamp: new Date(Date.now() - post.id * 86400000).toISOString(),
      source: "news",
      // Seeded reliable image using picsum
      image: `https://picsum.photos/seed/${post.id + 100}/800/400`
    }));

    return { articles, total: data.total, limit };
  } catch (error) {
    console.error("Public API Error:", error);
    return { articles: [], total: 0, limit: 9 };
  }
};
