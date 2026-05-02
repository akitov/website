import React from "react";
import { Layout } from "./_shared/Layout";

export function AboutMobile() {
  const socialLinkStyle: React.CSSProperties = {
    color: "#cc0000",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
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
    gap: "16px",
  };

  const circleBase: React.CSSProperties = {
    width: "70px",
    height: "70px",
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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#222">
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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#222">
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <rect x="8" y="4" width="8" height="13" fill="#e8e8e8" />
          <circle cx="12" cy="19.5" r="0.8" fill="#e8e8e8" />
        </svg>
      ),
      label: "Build products people love",
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h15v15H3z" />
          <path d="M6 11l4 4 8-9" />
        </svg>
      ),
      label: "Get things done",
    },
  ];

  return (
    <Layout activeNav="about" pageTitle="RESUMÉ" isMobile={true}>
      <div
        style={{
          width: "100%",
          padding: "30px 20px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Profile Photo */}
        <img
          src="https://i.pravatar.cc/120?img=52"
          alt="Alexander Kitov"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "16px",
          }}
        />

        {/* Name */}
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "26px",
            fontWeight: "bold",
            color: "#222",
            margin: "0 0 16px 0",
            textAlign: "center",
          }}
        >
          Alexander Kitov
        </h1>

        {/* Social Links */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px 16px",
            marginBottom: "30px",
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
        <div style={{ width: "100%", marginBottom: "40px" }}>
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
        <div style={{ width: "100%", marginBottom: "40px" }}>
          <h2
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "24px",
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

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {skills.map((skill) => (
              <div key={skill.title} style={endorseBlockStyle}>
                <div style={{ ...circleBase, backgroundColor: skill.bg }}>
                  <span style={{ fontSize: "22px", fontWeight: "normal", lineHeight: 1, fontFamily: "Arial, Helvetica, sans-serif" }}>
                    {skill.score}
                  </span>
                  <span style={{ fontSize: "9px", letterSpacing: "1px", marginTop: "2px", fontFamily: "Arial, Helvetica, sans-serif" }}>
                    ENDR
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px 0", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "17px", color: "#333", fontWeight: "normal" }}>
                    {skill.title}
                  </h3>
                  <p style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
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
              marginBottom: "24px",
            }}
          >
            I strive to:
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {striveItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "40px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
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
