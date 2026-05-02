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
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#444",
    marginBottom: "16px",
  };

  const endorseBlockStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  };

  const circleBase: React.CSSProperties = {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#333",
    flexShrink: 0,
  };

  const skills = [
    {
      score: 80,
      bg: "#a8d3c8",
      title: "User Experience",
      desc: "Product Concept, Wireframes, UI, Design, Measuring customer success",
    },
    {
      score: 63,
      bg: "#ececec",
      title: "Entrepreneurship",
      desc: "Market research, Positioning, Customer Development and Validation",
    },
    {
      score: 33,
      bg: "#b8d8e8",
      title: "Product Management",
      desc: "Team management, Prioritization, Removing obstacles and increasing velocity",
    },
  ];

  const striveItems = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#222">
          <circle cx="9" cy="7" r="3" />
          <circle cx="17" cy="9" r="2.2" />
          <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6v1H3v-1z" />
          <path d="M14.5 14c2.2 0 4.5 1.5 4.5 4v2h-4v-2c0-1.6-.6-3-1.5-4 .3 0 .7-.0 1-.0z" />
        </svg>
      ),
      label: "Help teams achieve their best",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#222">
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <rect x="8" y="4" width="8" height="13" fill="#e8e8e8" />
          <circle cx="12" cy="19.5" r="0.8" fill="#e8e8e8" />
        </svg>
      ),
      label: "Build products people love",
    },
    {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h15v15H3z" />
          <path d="M6 11l4 4 8-9" />
        </svg>
      ),
      label: "Get things done",
    },
  ];

  return (
    <Layout activeNav="about" pageTitle="RESUMÉ">
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
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "20px",
          }}
        />

        {/* Name */}
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "32px",
            fontWeight: "bold",
            color: "#222",
            margin: "0 0 18px 0",
          }}
        >
          Alexander Kitov
        </h1>

        {/* Social Links */}
        <div
          style={{
            display: "flex",
            gap: "22px",
            marginBottom: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <a style={socialLinkStyle}>
            <span>✉</span> Email
          </a>
          <a style={socialLinkStyle}>
            <span style={{ fontWeight: "bold" }}>M</span> Medium
          </a>
          <a style={socialLinkStyle}>
            <span style={{ fontWeight: "bold" }}>in</span> LinkedIn
          </a>
          <a style={socialLinkStyle}>
            <span>𝕏</span> Twitter
          </a>
          <a style={socialLinkStyle}>
            <span>S</span> Skype
          </a>
        </div>

        {/* Bio */}
        <div style={{ width: "100%", marginBottom: "50px" }}>
          <p style={bioTextStyle}>
            Product Manager and Entrepreneur. I am passionate about solving hard problems through technology. I do market research, gather feedback from customers and teams, translate needs into stories, create prototypes, propose roadmaps, help teams deliver and take responsibility for results. Customer satisfaction is my dopamine.
          </p>
          <p style={bioTextStyle}>
            Also a crypto believer, continuous learner and tennis enthusiast.
          </p>
          <p style={{ ...bioTextStyle, marginBottom: 0 }}>
            Thanks for stopping by!
            <br />
            <strong>Alex</strong>
          </p>
        </div>

        {/* Most endorsed Section */}
        <div style={{ width: "100%", marginBottom: "50px" }}>
          <h2
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Most endorsed
            <span
              style={{
                background: "#0077b5",
                color: "white",
                padding: "1px 5px",
                borderRadius: "2px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              in
            </span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {skills.map((skill) => (
              <div key={skill.title} style={endorseBlockStyle}>
                <div style={{ ...circleBase, backgroundColor: skill.bg }}>
                  <span style={{ fontSize: "26px", fontWeight: "normal", lineHeight: 1, fontFamily: "Arial, Helvetica, sans-serif" }}>
                    {skill.score}
                  </span>
                  <span style={{ fontSize: "9px", letterSpacing: "1px", marginTop: "2px", fontFamily: "Arial, Helvetica, sans-serif" }}>
                    ENDR
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "20px", color: "#333", fontWeight: "normal" }}>
                    {skill.title}
                  </h3>
                  <p style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", fontSize: "13px", color: "#666", lineHeight: 1.5 }}>
                    <strong style={{ color: "#444" }}>What exactly:</strong> {skill.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* I strive to Section */}
        <div style={{ width: "100%" }}>
          <h2
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "28px",
            }}
          >
            I strive to:
          </h2>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
            {striveItems.map((item, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ marginBottom: "14px", height: "40px", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </div>
                <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "14px", color: "#333" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
