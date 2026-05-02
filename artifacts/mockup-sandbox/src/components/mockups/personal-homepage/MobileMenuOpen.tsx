import React from "react";

export function MobileMenuOpen() {
  const tileBase: React.CSSProperties = {
    aspectRatio: "4 / 3",
    borderRadius: "8px",
    background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
    border: "1px solid #d0d0d0",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "30px",
    fontWeight: 300,
    color: "#9a9a9a",
    letterSpacing: "0.04em",
    cursor: "pointer",
    userSelect: "none",
  };

  const tileActive: React.CSSProperties = {
    ...tileBase,
    background: "#e6e6e6",
    border: "1px solid #c5c5c5",
    boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.12), inset 0 -1px 0 rgba(255, 255, 255, 0.4)",
    color: "#7a7a7a",
  };

  const items = [
    { label: "HOME", active: false },
    { label: "WORK", active: false },
    { label: "RESUMÉ", active: true },
  ];

  return (
    <div
      style={{
        background: "#e8e8e8",
        minHeight: "100vh",
        margin: 0,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <style>{`html, body { margin: 0; padding: 0; background: #e8e8e8; }`}</style>

      {/* Single white drawer card containing the header + tile grid */}
      <div
        style={{
          margin: "16px 14px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          background: "#ffffff",
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
            padding: "14px 14px",
            background: "#ffffff",
            position: "relative",
          }}
        >
          {/* Hamburger button — raised 3D look */}
          <button
            type="button"
            aria-label="Close menu"
            aria-pressed="true"
            style={{
              width: "50px",
              height: "44px",
              borderRadius: "8px",
              border: "1px solid #c5c5c5",
              background: "#e6e6e6",
              boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.12), inset 0 -1px 0 rgba(255, 255, 255, 0.4)",
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
            <span style={{ display: "block", width: "22px", height: "2px", background: "#7a7a7a", borderRadius: "1px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#7a7a7a", borderRadius: "1px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#7a7a7a", borderRadius: "1px" }} />
          </button>

          {/* Center: page title — bolder + larger for the menu drawer */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "0.02em",
              color: "#1a1a1a",
            }}
          >
            RESUMÉ
          </div>

          {/* Right: avatar with subtle border ring */}
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              zIndex: 1,
              border: "1px solid #e0e0e0",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
            }}
          >
            <img
              src="https://i.pravatar.cc/96?img=52"
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </nav>

        {/* Tile grid — inside the same white card */}
        <div
          style={{
            padding: "16px 14px 20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {items.map((item) => (
            <div key={item.label} style={item.active ? tileActive : tileBase}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
