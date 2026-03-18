const LOCAL_STORAGE_KEY = "my_admin_blogs";

export const getAdminBlogs = async () => {
  const apiKey = import.meta.env.VITE_JSONBIN_API_KEY;
  const binId = import.meta.env.VITE_JSONBIN_BIN_ID;

  if (!apiKey || !binId) {
    console.warn("JSONBin credentials missing. Using localStorage for admin blogs.");
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored && stored !== "undefined" ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Local storage parse error:", e);
      return [];
    }
  }

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: {
        "X-Master-Key": apiKey
      }
    });
    if (!res.ok) throw new Error("Failed to fetch admin blogs");
    const data = await res.json();
    return data.record.articles || [];
  } catch (err) {
    console.error("JSONBin GET Error:", err);
    throw err;
  }
};

export const saveAdminBlogs = async (blogs) => {
  const apiKey = import.meta.env.VITE_JSONBIN_API_KEY;
  const binId = import.meta.env.VITE_JSONBIN_BIN_ID;

  if (!apiKey || !binId) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blogs));
    return;
  }

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": apiKey
      },
      body: JSON.stringify({ articles: blogs })
    });
    if (!res.ok) throw new Error("Failed to save admin blogs");
  } catch (err) {
    console.error("JSONBin PUT Error:", err);
    throw err;
  }
};

// CRUD Helpers
export const createBlog = async (blog) => {
  const currentBlogs = await getAdminBlogs();
  const newBlog = {
    ...blog,
    id: `admin-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "admin"
  };
  const updatedBlogs = [newBlog, ...currentBlogs];
  await saveAdminBlogs(updatedBlogs);
  return newBlog;
};

export const updateBlog = async (id, updatedFields) => {
  const currentBlogs = await getAdminBlogs();
  const updatedBlogs = currentBlogs.map(b => 
    b.id === id ? { ...b, ...updatedFields, timestamp: new Date().toISOString() } : b
  );
  await saveAdminBlogs(updatedBlogs);
};

export const deleteBlog = async (id) => {
  const currentBlogs = await getAdminBlogs();
  const updatedBlogs = currentBlogs.filter(b => b.id !== id);
  await saveAdminBlogs(updatedBlogs);
};
