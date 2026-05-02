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
        paddingBottom: "10px",
        borderBottom: "1px solid #d0d0d0",
        marginBottom: "16px",
      }}
    >
      <span style={{ fontWeight: "bold", color: "#333" }}>{date}</span>
      <span style={{ fontStyle: "italic", color: "#888", fontFamily: "Georgia, serif", margin: "0 6px" }}>{type}</span>
      <a href="#" style={{ color: "#222", textDecoration: "none", fontWeight: "bold" }}>{category}</a>
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
    <div>
      <div
        style={{
          fontSize: "70px",
          color: "#bbb",
          fontFamily: "Georgia, serif",
          lineHeight: "0.6",
          marginBottom: "-10px",
          marginTop: "10px",
        }}
      >
        &ldquo;
      </div>
      <div
        style={{
          fontSize: "20px",
          color: "#333",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          lineHeight: "1.4",
        }}
      >
        {text}
      </div>
      <div style={{ marginTop: "16px", fontSize: "12px", fontFamily: "Arial, sans-serif", color: "#888" }}>
        <span style={{ marginRight: "4px" }}>🏷</span>
        <span style={{ fontStyle: "italic", fontFamily: "Georgia, serif" }}>{author}</span>
        {source && (
          <>
            ,{" "}
            <a href="#" style={{ color: "#cc0000", textDecoration: "none" }}>
              {source}
            </a>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Layout pageTitle="HOME" activeNav="home" isMobile={false}>
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
                style={{
                  background: "#f5f5f5",
                  border: "1px solid #d0d0d0",
                  borderRadius: "3px",
                  padding: "3px 10px",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "12px",
                  color: "#666",
                  cursor: "pointer",
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
