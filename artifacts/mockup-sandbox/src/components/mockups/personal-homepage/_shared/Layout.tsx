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
      {/* Red top stripe */}
      <div style={{ height: "4px", background: "#cc0000" }} />

      {/* Nav bar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 14px" : "0 24px",
          background: "#e8e8e8",
          height: isMobile ? "52px" : "60px",
          borderBottom: "1px solid #c8c8c8",
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

        {/* Right: avatar (with vertical separator on desktop) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0" : "20px",
            zIndex: 1,
          }}
        >
          {!isMobile && (
            <div
              style={{
                width: "1px",
                height: "44px",
                background: "#c8c8c8",
              }}
            />
          )}
          <div
            style={{
              width: isMobile ? "36px" : "44px",
              height: isMobile ? "36px" : "44px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src="https://i.pravatar.cc/88?img=52"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt="Profile"
            />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div>{children}</div>
    </div>
  );
}
