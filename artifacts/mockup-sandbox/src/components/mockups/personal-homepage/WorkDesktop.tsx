import React from "react";
import { Layout } from "./_shared/Layout";

export function WorkDesktop() {
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
    <Layout activeNav="work" pageTitle="WORK" isMobile={false}>
      <div style={{ paddingBottom: "80px" }}>
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: "bold",
            fontSize: "32px",
            color: "#222",
            textAlign: "center",
            marginTop: "60px",
            marginBottom: "30px",
          }}
        >
          Building products people love
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "50px",
            flexWrap: "wrap",
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
            maxWidth: "960px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0",
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
                  padding: "12px 0 40px",
                  textAlign: "center",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "22px",
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
