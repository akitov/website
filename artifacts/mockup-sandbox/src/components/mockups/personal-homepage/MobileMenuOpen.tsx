import React from "react";
import { Layout } from "./_shared/Layout";

export function MobileMenuOpen() {
  const items: { label: string; key: "home" | "work" | "about"; active?: boolean }[] = [
    { label: "HOME", key: "home" },
    { label: "WORK", key: "work" },
    { label: "RESUMÉ", key: "about", active: true },
  ];

  const tileBaseStyle: React.CSSProperties = {
    aspectRatio: "1 / 1",
    borderRadius: "8px",
    background: "#ffffff",
    border: "1px solid #d8d8d8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "32px",
    color: "#9a9a9a",
    letterSpacing: "0.04em",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  };

  const activeTileStyle: React.CSSProperties = {
    ...tileBaseStyle,
    background: "#ececec",
    border: "1px solid #cccccc",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.08)",
    color: "#888",
  };

  return (
    <Layout activeNav="about" pageTitle="RESUMÉ" isMobile={true}>
      <div
        style={{
          padding: "20px 14px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={item.active ? activeTileStyle : tileBaseStyle}
          >
            {item.label}
          </div>
        ))}
      </div>
    </Layout>
  );
}
