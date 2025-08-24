import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/content/blog-index.json", { cache: "no-cache" });
        const list = await res.json();
        const loaded = await Promise.all(
          list.map(async (path) => {
            const r = await fetch(path);
            return r.json();
          })
        );
        loaded.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(loaded);
        localStorage.setItem("blog_posts_cache", JSON.stringify(loaded));
      } catch {
        const cached = localStorage.getItem("blog_posts_cache");
        if (cached) setPosts(JSON.parse(cached));
      }
    }
    load();
  }, []);

  const filtered = posts.filter(p =>
    [p.title, p.excerpt, ...(p.tags || [])].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Blog</h1>
      <input
        placeholder="Search posts…"
        value={q}
        onChange={e => setQ(e.target.value)}
        style={styles.search}
      />
      <div style={styles.grid}>
        {filtered.map(post => (
          <article key={post.slug} style={styles.card}>
            {post.cover && (
              <img src={post.cover} alt={post.title} style={styles.cover} loading="lazy" />
            )}
            <div style={{padding:16}}>
              <h2 style={styles.title}>
                <Link to={`/blog/${post.slug}`} style={{textDecoration:"none", color:"#111"}}>
                  {post.title}
                </Link>
              </h2>
              <div style={styles.meta}>
                <span>{new Date(post.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{post.author}</span>
              </div>
              <p style={styles.excerpt}>{post.excerpt}</p>
              <div style={styles.tags}>
                {(post.tags || []).map(t => (
                  <span key={t} style={styles.tag}>#{t}</span>
                ))}
              </div>
              <Link to={`/blog/${post.slug}`} style={styles.btn}>Read More</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1100, margin: "40px auto", padding: "0 16px" },
  h1: { fontSize: 28, marginBottom: 16, fontWeight: 700 },
  search: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 16 },
  grid: { display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" },
  card: { border: "1px solid #eee", borderRadius: 12, background: "#fff", overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cover: { width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" },
  title: { fontSize: 18, margin: "0 0 8px" },
  meta: { display:"flex", gap:8, color:"#666", fontSize: 13, marginBottom: 8 },
  excerpt: { color: "#333", margin: "0 0 12px" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: { background:"#f5f5f5", padding:"4px 8px", borderRadius: 999, fontSize: 12 },
  btn: { display:"inline-block", padding:"10px 14px", background:"#ff7a18", color:"#fff", borderRadius: 10 }
};
