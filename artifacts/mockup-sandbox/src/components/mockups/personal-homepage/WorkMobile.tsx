import React from "react";
import { Layout } from "./_shared/Layout";

export function WorkMobile() {
  const portfolioItems = [
    {
      title: "betahaus | Sofia",
      image: "/__mockup/images/betahaus-sofia.png",
    },
    {
      title: "ZEIT MAGAZIN iPad App",
      image: "/__mockup/images/zeit-magazin-ipad.png",
    },
    {
      title: "DIE ZEIT iPad App",
      image: "/__mockup/images/die-zeit-ipad.png",
    },
  ];

  return (
    <Layout activeNav="work" pageTitle="WORK" isMobile={true}>
      <div style={{ paddingBottom: "40px" }}>
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: "bold",
            fontSize: "24px",
            color: "#222",
            textAlign: "center",
            marginTop: "40px",
            marginBottom: "20px",
            padding: "0 16px",
          }}
        >
          Building products people love
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginBottom: "30px",
            flexWrap: "wrap",
            padding: "0 16px",
          }}
        >
          {["betahaus | Sofia", "ZEIT MAGAZIN iPad App", "DIE ZEIT iPad App"].map((filter) => (
            <span key={filter} className="ak-pill">
              {filter}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0",
            padding: "0 14px",
          }}
        >
          {portfolioItems.map((item, index) => (
            <div key={index} style={{ display: "flex", flexDirection: "column" }}>
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
              <div
                style={{
                  padding: "12px 0 30px",
                  textAlign: "center",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "20px",
                  color: "#333",
                }}
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
