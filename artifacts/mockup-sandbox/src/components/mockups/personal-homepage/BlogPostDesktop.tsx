import React from "react";
import { Layout } from "./_shared/Layout";

export function BlogPostDesktop() {
  return (
    <Layout pageTitle="BLOG">
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px 64px" }}>
        {/* Post Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "24px 0",
            fontFamily: "'Arial Narrow', Arial, Helvetica, sans-serif",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px dotted #ccc",
            marginBottom: "40px",
          }}
          className="border-b-[0px]">
          <div style={{ cursor: "pointer" }}>
            <span style={{ color: "#cc0000", fontSize: "14px", marginRight: "6px" }}>‹</span>
            <span style={{ color: "#333" }}>A Quote in Product</span>
          </div>
          <div style={{ cursor: "pointer" }}>
            <span style={{ color: "#333", marginRight: "6px" }}>A Lesson in Life</span>
            <span style={{ color: "#cc0000", fontSize: "14px" }}>›</span>
          </div>
        </div>

        {/* Heading Area */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#222",
              marginBottom: "20px",
              lineHeight: 1.2,
            }}
          >
            How did the Slack UX convince our team?
          </h1>
          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "16px",
              color: "#555",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            See which parts of Slack's onboarding made an impression and what was the magic moment for me. It is rare that a user's first experience with a product is so easy and rewarding.
          </p>
        </div>

        {/* Main Content Area: 2-column */}
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
          {/* LEFT SIDEBAR */}
          <div style={{ width: "220px", flexShrink: 0 }}>
            <div style={{ marginBottom: "16px" }}>
              <img
                src="/__mockup/images/slack-ux-thumb.png"
                alt="Slack UX"
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", backgroundColor: "#ddd" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <a href="#" style={{ color: "#cc0000", fontSize: "12px", fontFamily: "Arial, sans-serif", fontWeight: "bold", textDecoration: "none" }}>
                Read more here
              </a>
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "13px", color: "#666", marginBottom: "8px" }}>
              a Lesson in UX
            </div>
            <div style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "11px", color: "#999", marginBottom: "20px" }}>
              01.03.2015
            </div>
            <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "0" }} />
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div style={{ flexGrow: 1, fontFamily: "Georgia, serif", fontSize: "16px", color: "#333", lineHeight: 1.6 }}>
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  float: "left",
                  fontSize: "80px",
                  lineHeight: "60px",
                  paddingTop: "4px",
                  fontWeight: "bold",
                  color: "#ccc",
                  marginRight: "8px",
                }}
              >
                H
              </span>
              ow does a software convince us users to use it? It's a subjective and complex process, but in my case I'd say it's almost always by:
            </div>
            
            <div style={{ clear: "both" }}></div>

            <blockquote
              style={{
                borderLeft: "3px solid #cc0000",
                margin: "20px 0",
                paddingLeft: "16px",
                fontWeight: "bold",
              }}
            >
              1. Focus on enabling me to do my "job to be done" quickly and easily.<br />
              2. Removing the unnecessary clutter.
            </blockquote>

            <p style={{ fontStyle: "italic", marginBottom: "32px", color: "#555" }}>
              I have to admit, even if 1) & 2) are not perfectly executed, I'd spend some extra time trying the service if I can feel the team has invested sufficient time in the User Experience.
            </p>

            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#222",
                marginBottom: "16px",
                marginTop: "40px",
              }}
            >
              Finding a chat software
            </h2>
            <p>
              Being the CEO of a startup you have to wear many hats. In the product manager role I try to take away all unnecessary distractions from our team and let them focus on their job to be done...
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
