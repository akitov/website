import React from "react";
import { Layout } from "./_shared/Layout";

export function HomeMobile() {
  const Quote = ({ text, author, source }: { text: string; author: string; source?: string }) => (
    <div
      style={{
        position: "relative",
        paddingLeft: "24px",
        borderLeft: "1px solid #c8c8c8",
        marginTop: "20px",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "16px",
          top: "-2px",
          fontSize: "36px",
          color: "#555",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic",
          lineHeight: 1,
        }}
      >
        &ldquo;
      </span>
      <div
        style={{
          fontSize: "18px",
          color: "#555",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontStyle: "italic",
          lineHeight: 1.4,
          paddingLeft: "16px",
        }}
      >
        {text}
        <span style={{ color: "#555", fontStyle: "italic", fontFamily: "Georgia, serif", marginLeft: "2px" }}>
          &rdquo;
        </span>
      </div>
      <div
        style={{
          marginTop: "16px",
          fontSize: "13px",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#666",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingLeft: "16px",
        }}
      >
        <span style={{ color: "#888", fontSize: "15px" }}>🪶</span>
        <span>
          {author}
          {source && (
            <>
              ,{" "}
              <a href="#" style={{ color: "#cc0000", textDecoration: "none" }}>
                {source}
              </a>
            </>
          )}
        </span>
      </div>
    </div>
  );

  const posts = [
    {
      id: 1,
      date: "03.02.2018",
      type: "a Quote in",
      category: "Product",
      content: (
        <Quote
          text="Be harsh, in the interest of being excellent."
          author="Stewart Butterfield, Slack"
          source="Source"
        />
      ),
    },
    {
      id: 2,
      date: "01.03.2015",
      type: "a Lesson in",
      category: "UX",
      content: (
        <div style={{ paddingTop: "20px" }}>
          <img 
            src="/__mockup/images/argyle.png" 
            alt="Argyle pattern" 
            style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} 
          />
        </div>
      ),
    },
    {
      id: 3,
      date: "21.03.2013",
      type: "a Lesson in",
      category: "Life",
      content: (
        <div style={{ paddingTop: "20px" }}>
          <img 
            src="/__mockup/images/elon.jpg" 
            alt="Elon Musk speaking" 
            style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} 
          />
        </div>
      ),
    }
  ];

  const pills = [
    { name: "Life", count: 3 },
    { name: "People", count: 1 },
    { name: "Product", count: 1 },
    { name: "UX", count: 1 },
  ];

  return (
    <Layout activeNav="home" pageTitle="HOME" isMobile={true}>
      <div style={{ padding: "40px 16px", margin: "0 auto", maxWidth: "100%" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "#222", margin: "0 0 24px 0", fontWeight: "bold" }}>
            Alexander Kitov
          </h1>
          
          {/* Pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {pills.map((pill) => (
              <span key={pill.name} className="ak-pill">
                {pill.name} ({pill.count})
              </span>
            ))}
          </div>
        </div>

        {/* Grid - 1 column for mobile */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {posts.map(post => (
            <div key={post.id}>
              <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "bold", color: "#222" }}>{post.date}</span>
                <span style={{ color: "#555" }}>{post.type}</span>
                <a href="#" className="ak-pill">{post.category}</a>
              </div>
              {post.content}
            </div>
          ))}
        </div>
        
      </div>
    </Layout>
  );
}
