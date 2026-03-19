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
    if (!res.ok) {
      // If bin doesn't exist or is empty, initialize it
      if (res.status === 404 || res.status === 400) {
        await saveAdminBlogs([]);
        return [];
      }
      throw new Error("Failed to fetch admin blogs");
    }
    const data = await res.json();
    return data.record?.articles || [];
  } catch (err) {
    console.error("JSONBin GET Error:", err);
    return [];
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
    // First check if bin exists
    const getRes = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: {
        "X-Master-Key": apiKey
      }
    });

    if (!getRes.ok) {
      // Bin doesn't exist, create it
      const createRes = await fetch(`https://api.jsonbin.io/v3/b`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": apiKey
        },
        body: JSON.stringify({ articles: blogs })
      });
      
      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error("JSONBin CREATE Error:", createRes.status, errorText);
        throw new Error(`Failed to create bin: ${createRes.status}`);
      }
      console.log("Created new JSONBin");
      return;
    }

    // Bin exists, update it
    let etag = getRes.headers.get("etag");
    
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": apiKey,
        ...(etag ? { "If-Match": etag } : {})
      },
      body: JSON.stringify({ articles: blogs })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("JSONBin PUT Error:", res.status, errorText);
      throw new Error(`Failed to save: ${res.status}`);
    }
    console.log("Saved to JSONBin successfully");
  } catch (err) {
    console.error("JSONBin Error:", err);
    // Fallback to localStorage on error
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blogs));
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
