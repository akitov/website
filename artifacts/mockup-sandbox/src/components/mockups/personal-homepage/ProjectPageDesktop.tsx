import React from "react";
import { Layout } from "./_shared/Layout";

export function ProjectPageDesktop() {
  return (
    <Layout activeNav="work" pageTitle="WORK">
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "20px 40px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
        
        {/* Top right navigation */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
          <a href="#" style={{ 
            color: "#cc0000", 
            textDecoration: "none", 
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "12px",
            fontWeight: "bold",
            letterSpacing: "0.08em"
          }}>
            ZEIT MAGAZIN iPad App <span style={{ fontFamily: "serif" }}>›</span>
          </a>
        </div>

        {/* Project Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ 
            fontSize: "36px", 
            fontWeight: "bold", 
            margin: "0 0 10px 0",
            color: "#333"
          }}>
            betahaus | Sofia
          </h1>
          <p style={{ 
            fontSize: "18px", 
            color: "#555",
            margin: 0,
            fontStyle: "italic"
          }}>
            Creating and establishing the first coworking space in Sofia.
          </p>
        </div>

        {/* Main Content Layout */}
        <div style={{ display: "flex", gap: "5%" }}>
          
          {/* Left Content Area (65%) */}
          <div style={{ width: "65%" }}>
            
            {/* Main Image */}
            <div style={{ marginBottom: "30px" }}>
              <img 
                src="/__mockup/images/betahaus-placeholder.png" 
                alt="betahaus sofia" 
                style={{ width: "100%", height: "auto", display: "block" }} 
              />
            </div>

            {/* Body Text */}
            <div style={{ lineHeight: "1.8", color: "#333", fontSize: "15px", marginBottom: "40px" }}>
              <span style={{
                float: "left",
                fontSize: "90px",
                fontWeight: "bold",
                color: "#ccc",
                lineHeight: "60px",
                paddingTop: "10px",
                marginRight: "8px",
                fontFamily: "Georgia, serif"
              }}>b</span>
              etahaus is the first coworking space in Sofia, Bulgaria. We are creating a working environment for freelancers, entrepreneurs and startups and the physical epicenter for most of the city's entrepreneurial activities. Of course it is all about added value and product experience. There is no way otherwise for such a product in the real estate business to open up a completely new market and take off in six months, break even, hold hundreds of events and host such an array of companies.
              <div style={{ clear: "both" }}></div>
            </div>

            <hr style={{ border: "none", borderTop: "1px dotted #ccc", marginBottom: "30px" }} />

            {/* Gallery Sections */}
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", margin: "0 0 5px 0", color: "#333" }}>Workspace</h3>
                <p style={{ margin: 0, color: "#666", fontSize: "14px", fontStyle: "italic" }}>
                  Everybody shares a nice, open working space with the right atmosphere for their creative minds.
                </p>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", margin: "0 0 5px 0", color: "#333" }}>Before and after</h3>
                <p style={{ margin: 0, color: "#666", fontSize: "14px", fontStyle: "italic" }}>
                  Photographic project by <a href="#" style={{ color: "#cc0000", textDecoration: "none" }}>Gergana Dzhevelieva</a>
                </p>
              </div>
            </div>

          </div>

          {/* Right Sidebar (30%) */}
          <div style={{ width: "30%" }}>
            
            <div style={{ 
              fontSize: "28px", 
              fontStyle: "italic", 
              color: "#333",
              marginBottom: "30px"
            }}>
              betahaus | sofia
            </div>

            <div style={{ 
              fontFamily: "Arial, Helvetica, sans-serif", 
              fontSize: "12px",
              lineHeight: "1.6",
              color: "#444"
            }}>
              <div style={{ marginBottom: "15px" }}>
                <span style={{ fontWeight: "bold" }}>Position:</span> <br/>
                Co-Founder
              </div>
              <div style={{ marginBottom: "15px" }}>
                <span style={{ fontWeight: "bold" }}>Achievements:</span> <br/>
                Angel capital raised, TEdxBG Speaker, Empower 2011 Finalists, Forbes Startup of the year finalist 2012
              </div>
              <div style={{ marginBottom: "30px" }}>
                <span style={{ fontWeight: "bold" }}>Date:</span> <br/>
                03.2011 - present
              </div>
            </div>

            <a href="#" style={{
              display: "inline-block",
              color: "#cc0000",
              textDecoration: "none",
              fontFamily: "Georgia, serif",
              fontSize: "16px",
              paddingBottom: "4px",
              borderBottom: "2px solid #cc0000",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
              View Project
            </a>

          </div>

        </div>
      </div>
    </Layout>
  );
}
