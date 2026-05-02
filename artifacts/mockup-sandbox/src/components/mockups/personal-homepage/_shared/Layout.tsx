import React from "react";

export interface LayoutProps {
  children: React.ReactNode;
  activeNav?: "home" | "work" | "about";
  pageTitle: string;
  isMobile?: boolean;
}

export function Layout({ children, activeNav, pageTitle, isMobile = false }: LayoutProps) {
  const navLinkStyle = (key: "home" | "work" | "about"): React.CSSProperties => ({
    fontFamily: "'Arial Narrow', Arial, Helvetica, sans-serif",
    fontSize: isMobile ? "10px" : "12px",
    fontWeight: activeNav === key ? "bold" : "normal",
    letterSpacing: "0.08em",
    color: activeNav === key ? "#cc0000" : "#555",
    textDecoration: "none",
    cursor: "pointer",
    userSelect: "none",
  });

  return (
    <div
      style={{
        background: "#e8e8e8",
        minHeight: "100vh",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Header card — red stripe sits flush atop the white nav, all rounded together */}
      <div
        style={{
          maxWidth: isMobile ? "100%" : "960px",
          margin: isMobile ? "0" : "30px auto 0",
          borderRadius: isMobile ? "0" : "6px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          background: "#ffffff",
        }}
      >
        {/* Red top stripe — part of the card */}
        <div style={{ height: "4px", background: "#cc0000" }} />

        {/* Nav bar */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "0 14px" : "0 16px",
            background: "#ffffff",
            height: isMobile ? "52px" : "60px",
            position: "relative",
          }}
        >
        {/* Left: nav links */}
        <div style={{ display: "flex", gap: isMobile ? "10px" : "18px", zIndex: 1 }}>
          <span style={navLinkStyle("home")}>HOME</span>
          <span style={navLinkStyle("work")}>WORK</span>
          <span style={navLinkStyle("about")}>RESUMÉ</span>
        </div>

        {/* Center: page title */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Arial Narrow', Arial, Helvetica, sans-serif",
            fontSize: isMobile ? "12px" : "14px",
            fontWeight: "bold",
            letterSpacing: "0.12em",
            color: "#333",
          }}
        >
          {pageTitle}
        </div>

        {/* Right: avatar */}
        <div
          style={{
            width: isMobile ? "36px" : "44px",
            height: isMobile ? "36px" : "44px",
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          <img
            src="https://i.pravatar.cc/88?img=52"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt="Profile"
          />
        </div>
        </nav>
      </div>

      {/* Main content */}
      <div>{children}</div>
    </div>
  );
}
