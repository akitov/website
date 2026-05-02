import React from "react";
import { Layout } from "./_shared/Layout";

export function HomeDesktop() {
  const posts = [
    {
      id: 1,
      date: "03.02.2018",
      type: "a Quote in",
      category: "Product",
      content: (
        <div style={{ paddingTop: "20px" }}>
          <div style={{ fontSize: "80px", color: "#ccc", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: "0.8", marginBottom: "-20px" }}>"</div>
          <div style={{ fontSize: "28px", color: "#333", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: "1.4" }}>
            Be harsh, in the interest of being excellent.
          </div>
          <div style={{ marginTop: "20px", fontSize: "12px", fontFamily: "Arial, sans-serif", color: "#666" }}>
            ✎ Stewart Butterfield, Slack, <a href="#" style={{ color: "#cc0000", textDecoration: "none" }}>Source</a>
          </div>
        </div>
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
    <Layout pageTitle="" isMobile={false}>
      <div style={{ padding: "60px 24px", maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "48px", color: "#222", margin: "0 0 30px 0", fontWeight: "bold" }}>
            Alexander Kitov
          </h1>
          
          {/* Pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            {pills.map((pill) => (
              <div 
                key={pill.name} 
                style={{ 
                  border: "1px solid #888", 
                  borderRadius: "2px", 
                  padding: "4px 12px", 
                  fontFamily: "Arial, sans-serif", 
                  fontSize: "13px", 
                  color: "#555", 
                  cursor: "pointer" 
                }}
              >
                {pill.name} ({pill.count})
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
          {/* Left Column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "60px" }}>
            {[posts[0], posts[2]].map(post => (
              <div key={post.id}>
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#555", borderBottom: "1px solid #d8d8d8", paddingBottom: "10px" }}>
                  {post.date} &nbsp;<span style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>{post.type}</span>&nbsp; <a href="#" style={{ color: "#555", textDecoration: "none", cursor: "pointer" }}>{post.category}</a>
                </div>
                {post.content}
              </div>
            ))}
          </div>
          
          {/* Right Column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "60px" }}>
            {[posts[1]].map(post => (
              <div key={post.id}>
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#555", borderBottom: "1px solid #d8d8d8", paddingBottom: "10px" }}>
                  {post.date} &nbsp;<span style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>{post.type}</span>&nbsp; <a href="#" style={{ color: "#555", textDecoration: "none", cursor: "pointer" }}>{post.category}</a>
                </div>
                {post.content}
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </Layout>
  );
}
