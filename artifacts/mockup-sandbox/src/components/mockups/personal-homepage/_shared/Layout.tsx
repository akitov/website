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
        margin: 0,
      }}
    >
      <style>{`
        html, body { margin: 0; padding: 0; background: #e8e8e8; }
        .ak-pill { background: #efefef; border: none; border-radius: 4px; padding: 3px 10px; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #222; text-decoration: none; cursor: pointer; display: inline-block; transition: background 0.15s ease; }
        .ak-pill:hover { background: #ffffff; }
        .ak-arrow-link { color: #333; text-decoration: none; font-family: Arial, Helvetica, sans-serif; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; }
        .ak-arrow-link .ak-arrow { color: #cc0000; margin-left: 6px; font-weight: normal; font-size: 1.15em; }
        .ak-arrow-link.ak-arrow-prev .ak-arrow { margin-left: 0; margin-right: 6px; }
      `}</style>
      {/* Header card — red stripe sits flush atop the white nav, all rounded together */}
      <div
        style={{
          maxWidth: isMobile ? "auto" : "960px",
          margin: isMobile ? "16px 14px 0" : "30px auto 0",
          borderRadius: isMobile ? "8px" : "6px",
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
            padding: isMobile ? "12px 14px" : "0 16px",
            background: "#ffffff",
            height: isMobile ? "auto" : "60px",
            position: "relative",
          }}
        >
        {/* Left: hamburger (mobile) or nav links (desktop) */}
        {isMobile ? (
          <button
            type="button"
            aria-label="Open menu"
            style={{
              width: "50px",
              height: "44px",
              borderRadius: "8px",
              border: "1px solid #cfcfcf",
              background: "linear-gradient(180deg, #ffffff 0%, #f3f3f3 100%)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              padding: 0,
              cursor: "pointer",
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: "#999", borderRadius: "1px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#999", borderRadius: "1px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#999", borderRadius: "1px" }} />
          </button>
        ) : (
          <div style={{ display: "flex", gap: "18px", zIndex: 1 }}>
            <span style={navLinkStyle("home")}>HOME</span>
            <span style={navLinkStyle("work")}>WORK</span>
            <span style={navLinkStyle("about")}>RESUMÉ</span>
          </div>
        )}

        {/* Center: page title */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: isMobile
              ? "'Helvetica Neue', Helvetica, Arial, sans-serif"
              : "'Arial Narrow', Arial, Helvetica, sans-serif",
            fontSize: isMobile ? "26px" : "14px",
            fontWeight: isMobile ? 800 : "bold",
            letterSpacing: isMobile ? "0.02em" : "0.12em",
            color: isMobile ? "#1a1a1a" : "#222",
          }}
          className="text-[22px]">
          {pageTitle}
        </div>

        {/* Right: avatar */}
        <div
          style={{
            width: isMobile ? "44px" : "44px",
            height: isMobile ? "44px" : "44px",
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
      {/* Footer card — mirrors header: white card with red BOTTOM stripe, rounded */}
      <div
        style={{
          maxWidth: isMobile ? "auto" : "960px",
          margin: isMobile ? "60px 14px 16px" : "60px auto 30px",
          borderRadius: isMobile ? "8px" : "6px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            padding: isMobile ? "30px 16px 20px" : "36px 24px 24px",
            textAlign: "center",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          <div style={{ fontSize: isMobile ? "18px" : "20px", color: "#333", marginBottom: "16px" }}>
            Alexander Kitov
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: isMobile ? "14px" : "20px",
              flexWrap: "wrap",
              marginBottom: "20px",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "13px",
            }}
          >
            {[
              { icon: "✉", label: "Email" },
              { icon: "✎", label: "Medium" },
              { icon: "in", label: "LinkedIn" },
              { icon: "𝕏", label: "Twitter" },
              { icon: "☏", label: "Skype" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                style={{
                  color: "#cc0000",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontWeight: "bold",
                }}
              >
                <span style={{ fontSize: "13px" }}>{s.icon}</span>
                {s.label}
              </a>
            ))}
          </div>
          <div style={{ fontSize: "11px", color: "#999", fontFamily: "Arial, Helvetica, sans-serif" }}>
            © 2024
          </div>
        </div>
        {/* Red bottom stripe — mirror of the header's top stripe */}
        <div style={{ height: "4px", background: "#cc0000" }} />
      </div>
    </div>
  );
}
