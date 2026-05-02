import React from "react";
import { Layout } from "./_shared/Layout";

export function AboutDesktop() {
  const socialLinkStyle: React.CSSProperties = {
    color: "#cc0000",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
  };

  const bioTextStyle: React.CSSProperties = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#333",
    marginBottom: "16px",
  };

  const endorseBlockStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    flex: 1,
  };

  const circleStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#5fbeaa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    flexShrink: 0,
  };

  return (
    <Layout activeNav="about" pageTitle="RESUM?">
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "40px 20px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Profile Photo */}
        <img
          src="https://i.pravatar.cc/180?img=52"
          alt="Alexander Kitov"
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "16px",
          }}
        />

        {/* Name */}
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "32px",
            fontWeight: "bold",
            color: "#333",
            margin: "0 0 16px 0",
          }}
        >
          Alexander Kitov
        </h1>

        {/* Social Links */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <a style={socialLinkStyle}>
            <span>✉</span> Email
          </a>
          <a style={socialLinkStyle}>
            <span>✎</span> Medium
          </a>
          <a style={socialLinkStyle}>
            <span style={{ fontWeight: "bold" }}>in</span> LinkedIn
          </a>
          <a style={socialLinkStyle}>
            <span>𝕏</span> Twitter
          </a>
          <a style={socialLinkStyle}>
            <span>☎</span> Skype
          </a>
        </div>

        {/* Bio */}
        <div style={{ maxWidth: "700px", width: "100%", marginBottom: "40px" }}>
          <p style={bioTextStyle}>
            Product Manager and Entrepreneur. I am passionate about solving hard problems through technology. I do market research, gather feedback from customers and teams, translate needs into stories, create prototypes, propose roadmaps, help teams deliver and take responsibility for results. Customer satisfaction is my dopamine.
          </p>
          <p style={bioTextStyle}>
            Also a crypto believer, continuous learner and tennis enthusiast.
          </p>
          <p style={bioTextStyle}>
            Thanks for stopping by!
            <br />
            <strong>Alex</strong>
          </p>
        </div>

        {/* Skills Section */}
        <div style={{ width: "100%" }}>
          <h2
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Most endorsed in:
            <span
              style={{
                background: "#0077b5",
                color: "white",
                padding: "2px 4px",
                borderRadius: "2px",
                fontSize: "10px",
              }}
            >
              in
            </span>
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "24px",
            }}
          >
            {/* Skill 1 */}
            <div style={endorseBlockStyle}>
              <div style={circleStyle}>
                <span style={{ fontSize: "28px", fontWeight: "bold", lineHeight: 1 }}>80</span>
                <span style={{ fontSize: "10px", letterSpacing: "1px" }}>ENDR</span>
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontFamily: "Georgia", fontSize: "16px", color: "#333" }}>
                  User Experience
                </h3>
                <p style={{ margin: 0, fontFamily: "Arial", fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
                  What exactly: Product Concept, Wireframes, UI, Design, Measuring customer success
                </p>
              </div>
            </div>

            {/* Skill 2 */}
            <div style={endorseBlockStyle}>
              <div style={circleStyle}>
                <span style={{ fontSize: "28px", fontWeight: "bold", lineHeight: 1 }}>67</span>
                <span style={{ fontSize: "10px", letterSpacing: "1px" }}>ENDR</span>
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontFamily: "Georgia", fontSize: "16px", color: "#333" }}>
                  Product Management
                </h3>
                <p style={{ margin: 0, fontFamily: "Arial", fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
                  What exactly: MVP, Business Model, KPIs, Roadmap, Stakeholder management
                </p>
              </div>
            </div>

            {/* Skill 3 */}
            <div style={endorseBlockStyle}>
              <div style={circleStyle}>
                <span style={{ fontSize: "28px", fontWeight: "bold", lineHeight: 1 }}>52</span>
                <span style={{ fontSize: "10px", letterSpacing: "1px" }}>ENDR</span>
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontFamily: "Georgia", fontSize: "16px", color: "#333" }}>
                  Entrepreneurship
                </h3>
                <p style={{ margin: 0, fontFamily: "Arial", fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
                  What exactly: Lean startup, Funding, Go-to-market strategy, Growth
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
