import React from "react";
import { Layout } from "./_shared/Layout";

export function HomeDesktop() {
  const pills = [
    { name: "Life", count: 3 },
    { name: "People", count: 1 },
    { name: "Product", count: 1 },
    { name: "UX", count: 1 },
  ];

  const PostHeader = ({ date, type, category }: { date: string; type: string; category: string }) => (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "12px",
        marginBottom: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span style={{ fontWeight: "bold", color: "#222" }}>{date}</span>
      <span style={{ color: "#555", fontWeight: "normal" }}>{type}</span>
      <a
        href="#"
        className="ak-pill"
        style={{
          color: "#222",
          textDecoration: "none",
          background: "#efefef",
          border: "none",
          borderRadius: "4px",
          padding: "3px 10px",
          fontSize: "12px",
          fontWeight: "normal",
          transition: "background 0.15s ease",
        }}
      >
        {category}
      </a>
    </div>
  );

  const ReadMore = () => (
    <a
      href="#"
      style={{
        display: "inline-block",
        marginTop: "14px",
        color: "#cc0000",
        fontSize: "12px",
        fontFamily: "Arial, Helvetica, sans-serif",
        textDecoration: "underline",
        textDecorationColor: "#cc0000",
      }}
    >
      Read More...
    </a>
  );

  const Title = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "26px",
        fontWeight: "normal",
        color: "#333",
        margin: "0 0 12px 0",
        lineHeight: 1.25,
      }}
    >
      {children}
    </h2>
  );

  const Excerpt = ({ children }: { children: React.ReactNode }) => (
    <p
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "13px",
        color: "#666",
        lineHeight: 1.6,
        margin: 0,
      }}
    >
      {children}
    </p>
  );

  const Quote = ({ text, author, source }: { text: string; author: string; source?: string }) => (
    <div
      style={{
        position: "relative",
        paddingLeft: "30px",
        borderLeft: "1px solid #c8c8c8",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "20px",
          top: "-2px",
          fontSize: "42px",
          color: "#555",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic",
          lineHeight: 1,
        }}
      >
        &ldquo;
      </span>
      <div
        style={{
          fontSize: "24px",
          color: "#555",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontStyle: "italic",
          lineHeight: "1.4",
          paddingLeft: "20px",
        }}
      >
        {text}
        <span style={{ color: "#555", fontStyle: "italic", fontFamily: "Georgia, serif", marginLeft: "2px" }}>
          &rdquo;
        </span>
      </div>
      <div
        style={{
          marginTop: "18px",
          fontSize: "14px",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#666",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingLeft: "20px",
        }}
      >
        <span style={{ color: "#888", fontSize: "16px" }}>🪶</span>
        <span>
          {author}
          {source && (
            <>
              ,{" "}
              <a href="#" style={{ color: "#cc0000", textDecoration: "none" }}>
                {source}
              </a>
            </>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <Layout pageTitle="HOME" activeNav="home" isMobile={false}>
      <style>{`.ak-pill:hover { background: #ffffff !important; }`}</style>
      <div style={{ padding: "40px 24px 0", maxWidth: "900px", margin: "0 auto" }}>
        {/* Page heading */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "40px",
              color: "#222",
              margin: "0 0 22px 0",
              fontWeight: "bold",
            }}
          >
            Alexander Kitov
          </h1>

          {/* Category filter pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {pills.map((pill) => (
              <div
                key={pill.name}
                className="ak-pill"
                style={{
                  background: "#efefef",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 12px",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "12px",
                  color: "#333",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                {pill.name} ({pill.count})
              </div>
            ))}
          </div>
        </div>

        {/* Two-column post grid */}
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", paddingTop: "30px" }}>
          {/* LEFT COLUMN */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "44px" }}>
            {/* Quote post */}
            <div>
              <PostHeader date="03.02.2018" type="a Quote in" category="Product" />
              <Quote
                text="Be harsh, in the interest of being excellent."
                author="Stewart Butterfield, Slack"
                source="Source"
              />
            </div>

            {/* Lesson with image */}
            <div>
              <PostHeader date="21.03.2013" type="a Lesson in" category="Life" />
              <img
                src="/__mockup/images/elon.jpg"
                alt="Elon Musk speaking"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", marginBottom: "16px" }}
              />
              <Title>First principles reasoning</Title>
              <Excerpt>
                Elon Musk answers how he succeeds in pursuing such groundbreaking ideas and how he has been able to innovate so often.
              </Excerpt>
              <ReadMore />
            </div>

            {/* Lesson without image */}
            <div>
              <PostHeader date="23.02.2013" type="a Lesson in" category="People" />
              <Title>You lose less by trusting more</Title>
              <Excerpt>
                Managing a business is not about asserting control to minimize costs and risks, but about working collaboratively to achieve an agreed goal.
              </Excerpt>
              <ReadMore />
            </div>

            {/* Event */}
            <div>
              <PostHeader date="07.01.2013" type="an Event in" category="Life" />
              <Title>Speaker at TEDxBG 2012</Title>
              <Excerpt>
                Presenting the coworking phenomenon through the lens of betahaus | sofia.
              </Excerpt>
              <ReadMore />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "44px" }}>
            {/* Lesson with argyle image */}
            <div>
              <PostHeader date="01.03.2015" type="a Lesson in" category="UX" />
              <img
                src="/__mockup/images/argyle.png"
                alt="Argyle pattern"
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", marginBottom: "16px" }}
              />
              <Title>How did the Slack UX convince our team?</Title>
              <Excerpt>
                See which parts of Slack's onboarding made an impression and what was the magic moment for me. It is rare that a user's first experience with a product is so easy and rewarding.
              </Excerpt>
              <ReadMore />
            </div>

            {/* Quote */}
            <div>
              <PostHeader date="07.01.2013" type="a Quote in" category="Life" />
              <Quote
                text="Once you make a decision, the universe conspires to make it happen."
                author="Ralph Waldo Emerson"
                source="Source"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
