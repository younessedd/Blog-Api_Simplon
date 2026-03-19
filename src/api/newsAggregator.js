// src/api/newsAggregator.js

const fetchDummyJSON = async (page = 1, category = "all", limit = 9) => {
  const skip = (page - 1) * limit;
  let url = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}`;
  
  if (category && category !== "all") {
    url = `https://dummyjson.com/posts/tag/${category}?limit=${limit}&skip=${skip}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    return data.posts.map(post => ({
      id: `dummy-${post.id}`,
      title: post.title,
      content: post.body,
      author: `User ${post.userId}`,
      category: post.tags[0] || "general",
      timestamp: new Date(Date.now() - post.id * 86400000).toISOString(),
      source: "DummyJSON",
      image: `https://picsum.photos/seed/${post.id + 100}/800/400`
    }));
  } catch (error) {
    console.error("DummyJSON Error:", error);
    return [];
  }
};

const fetchJSONPlaceholder = async (page = 1, limit = 9) => {
  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`);
    const data = await res.json();
    
    return data.map(post => ({
      id: `placeholder-${post.id}`,
      title: post.title,
      content: post.body,
      author: `User ${post.userId}`,
      category: "technology",
      timestamp: new Date(Date.now() - post.id * 10000000).toISOString(),
      source: "JSONPlaceholder",
      image: `https://picsum.photos/seed/${post.id + 500}/800/400`
    }));
  } catch (error) {
    console.error("JSONPlaceholder Error:", error);
    return [];
  }
};

const fetchDevTo = async (page = 1, tag = "", limit = 9) => {
  try {
    let url = `https://dev.to/api/articles?per_page=${limit}&page=${page}`;
    if (tag && tag !== "all") {
      url = `https://dev.to/api/articles?per_page=${limit}&page=${page}&tag=${tag}`;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    
    return data.map(post => ({
      id: `devto-${post.id}`,
      title: post.title,
      content: post.description || post.body_markdown,
      author: post.user?.name || "Dev.to Author",
      category: tag || "technology",
      timestamp: post.published_at,
      source: "Dev.to",
      image: post.cover_image || `https://picsum.photos/seed/${post.id + 800}/800/400`
    }));
  } catch (error) {
    console.error("Dev.to Error:", error);
    return [];
  }
};

export const getAggregatedNews = async (page = 1, category = "all", limit = 9) => {
  const results = await Promise.allSettled([
    fetchDummyJSON(page, category, limit),
    fetchJSONPlaceholder(page, limit),
    fetchDevTo(page, category === "all" ? "technology" : category, limit)
  ]);

  let allArticles = [];
  
  results.forEach(result => {
    if (result.status === "fulfilled") {
      allArticles = [...allArticles, ...result.value];
    }
  });

  // Shuffle to mix sources
  return allArticles.sort(() => Math.random() - 0.5);
};

export const getAggregatedCategories = () => {
  return [
    "all", 
    "technology", 
    "science", 
    "history", 
    "lifestyle", 
    "programming",
    "webdev",
    "javascript",
    "react",
    "python"
  ];
};
