import React from "react";
import { Layout } from "./_shared/Layout";

export function BlogPostMobile() {
  return (
    <Layout pageTitle="BLOG" isMobile={true}>
      <div style={{ padding: "0 14px 40px" }}>
        {/* Post Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px dotted #ccc", marginBottom: "24px" }}>
          <a href="#" className="ak-arrow-link ak-arrow-prev" style={{ fontSize: "10px" }}>
            <span className="ak-arrow">‹</span> A Quote in Product
          </a>
          <a href="#" className="ak-arrow-link" style={{ fontSize: "10px" }}>
            A Lesson in Life <span className="ak-arrow">›</span>
          </a>
        </div>

        {/* Heading Area */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "24px",
              fontWeight: "bold",
              color: "#222",
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            How did the Slack UX convince our team?
          </h1>
          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "14px",
              color: "#555",
              lineHeight: 1.6,
            }}
          >
            See which parts of Slack's onboarding made an impression and what was the magic moment for me. It is rare that a user's first experience with a product is so easy and rewarding.
          </p>
        </div>

        {/* Mobile 1-column Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* TOP META / THUMBNAIL */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <img
                src="/__mockup/images/slack-ux-thumb.png"
                alt="Slack UX"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", backgroundColor: "#ddd" }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "8px" }}>
                <a href="#" className="ak-arrow-link" style={{ fontSize: "12px" }}>
                  A Lesson in UX <span className="ak-arrow">›</span>
                </a>
              </div>
              <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontWeight: "bold", fontSize: "11px", color: "#999", marginBottom: "16px" }}>
                01.03.2015
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "0" }} />
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#333", lineHeight: 1.6 }}>
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  float: "left",
                  fontSize: "60px",
                  lineHeight: "48px",
                  paddingTop: "4px",
                  fontWeight: "bold",
                  color: "#ccc",
                  marginRight: "6px",
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
                paddingLeft: "12px",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              1. Focus on enabling me to do my "job to be done" quickly and easily.<br />
              2. Removing the unnecessary clutter.
            </blockquote>

            <p style={{ fontStyle: "italic", marginBottom: "24px", color: "#555" }}>
              I have to admit, even if 1) & 2) are not perfectly executed, I'd spend some extra time trying the service if I can feel the team has invested sufficient time in the User Experience.
            </p>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#222",
                marginBottom: "12px",
                marginTop: "30px",
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
