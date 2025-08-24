import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/content/blog/${slug}.json`);
        if (!res.ok) return setNotFound(true);
        const json = await res.json();
        setPost(json);
        const recent = JSON.parse(localStorage.getItem("recent_posts") || "[]");
        const filtered = recent.filter(x => x.slug !== json.slug).slice(0, 9);
        localStorage.setItem("recent_posts", JSON.stringify([{slug: json.slug, title: json.title}, ...filtered]));
      } catch {
        setNotFound(true);
      }
    }
    load();
    window.scrollTo(0,0);
  }, [slug]);

  const safeHtml = useMemo(() => {
    if (!post) return "";
    const html = marked.parse(post.content || "");
    return { __html: DOMPurify.sanitize(html) };
  }, [post]);

  if (notFound) {
    return (
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Post not found</h1>
        <Link to="/blog">← Back to Blog</Link>
      </div>
    );
  }

  if (!post) return <div style={styles.wrap}>Loading…</div>;

  return (
    <div style={styles.wrap}>
      <Link to="/blog" style={{display:"inline-block", marginBottom:10}}>← Back to Blog</Link>
      <h1 style={styles.h1}>{post.title}</h1>
      <div style={styles.meta}>
        <span>{new Date(post.date).toLocaleDateString()}</span>
        <span>•</span>
        <span>{post.author}</span>
      </div>
      {post.cover && <img src={post.cover} alt={post.title} style={styles.cover} loading="lazy" />}
      <article style={styles.content} dangerouslySetInnerHTML={safeHtml} />
      <div style={styles.tags}>
        {(post.tags || []).map(t => <span key={t} style={styles.tag}>#{t}</span>)}
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 900, margin: "40px auto", padding: "0 16px" },
  h1: { fontSize: 32, margin: "8px 0 4px", fontWeight: 800 },
  meta: { display: "flex", gap: 8, color: "#666", fontSize: 13, marginBottom: 12 },
  cover: { width: "100%", borderRadius: 12, margin: "8px 0 16px", objectFit: "cover" },
  content: { lineHeight: 1.8, color: "#1f2937" },
  tags: { display: "flex", gap: 8, marginTop: 16 },
  tag: { background:"#f5f5f5", padding:"4px 8px", borderRadius: 999, fontSize: 12 }
};
