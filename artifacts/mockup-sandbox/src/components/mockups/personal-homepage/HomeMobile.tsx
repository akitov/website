import React from "react";
import { Layout } from "./_shared/Layout";

export function HomeMobile() {
  const Quote = ({ text, author, source }: { text: string; author: string; source?: string }) => (
    <div
      style={{
        position: "relative",
        paddingLeft: "24px",
        borderLeft: "1px solid #c8c8c8",
        marginTop: "20px",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "16px",
          top: "-2px",
          fontSize: "36px",
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
          fontSize: "18px",
          color: "#555",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontStyle: "italic",
          lineHeight: 1.4,
          paddingLeft: "16px",
        }}
      >
        {text}
        <span style={{ color: "#555", fontStyle: "italic", fontFamily: "Georgia, serif", marginLeft: "2px" }}>
          &rdquo;
        </span>
      </div>
      <div
        style={{
          marginTop: "16px",
          fontSize: "13px",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#666",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingLeft: "16px",
        }}
      >
        <span style={{ color: "#888", fontSize: "15px" }}>🪶</span>
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

  const Title = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "30px",
        fontWeight: "normal",
        color: "#222",
        margin: "20px 0 14px 0",
        lineHeight: 1.2,
      }}
    >
      {children}
    </h2>
  );

  const Excerpt = ({ children }: { children: React.ReactNode }) => (
    <p
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "16px",
        color: "#666",
        lineHeight: 1.6,
        margin: 0,
      }}
    >
      {children}
    </p>
  );

  const ReadMore = () => (
    <a
      href="#"
      style={{
        display: "inline-block",
        marginTop: "22px",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "15px",
        fontWeight: "bold",
        color: "#cc0000",
        textDecoration: "none",
        borderBottom: "2px solid #cc0000",
        paddingBottom: "3px",
      }}
    >
      Read More...
    </a>
  );

  const posts = [
    {
      id: 1,
      date: "03.02.2018",
      type: "a Quote in",
      category: "Product",
      content: (
        <Quote
          text="Be harsh, in the interest of being excellent."
          author="Stewart Butterfield, Slack"
          source="Source"
        />
      ),
    },
    {
      id: 2,
      date: "01.03.2015",
      type: "a Lesson in",
      category: "UX",
      content: (
        <div style={{ paddingTop: "16px" }}>
          <img
            src="/__mockup/images/argyle.png"
            alt="Argyle pattern"
            style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
          />
          <Title>How did the Slack UX convince our team?</Title>
          <Excerpt>
            See which parts of Slack&rsquo;s onboarding made an impression and what was the magic moment for me. It is rare that a user&rsquo;s first experience with a product is so easy and rewarding.
          </Excerpt>
          <ReadMore />
        </div>
      ),
    },
    {
      id: 3,
      date: "21.03.2013",
      type: "a Lesson in",
      category: "Life",
      content: (
        <div style={{ paddingTop: "16px" }}>
          <img
            src="/__mockup/images/elon.jpg"
            alt="Elon Musk speaking"
            style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
          />
          <Title>First principles reasoning</Title>
          <Excerpt>
            Elon Musk answers how he succeeds in pursuing such groundbreaking ideas and how he has been able to innovate so often.
          </Excerpt>
          <ReadMore />
        </div>
      ),
    },
    {
      id: 4,
      date: "23.02.2013",
      type: "a Lesson in",
      category: "People",
      content: (
        <div>
          <Title>You lose less by trusting more</Title>
          <Excerpt>
            Managing a business is not about asserting control to minimize costs and risks, but about working collaboratively to achieve an agreed goal.
          </Excerpt>
          <ReadMore />
        </div>
      ),
    },
    {
      id: 5,
      date: "07.01.2013",
      type: "an Event in",
      category: "Life",
      content: (
        <div>
          <Title>Speaker at TEDxBG 2012</Title>
          <Excerpt>
            Presenting the coworking phenomenon through the lens of betahaus | sofia.
          </Excerpt>
          <ReadMore />
        </div>
      ),
    },
    {
      id: 6,
      date: "07.01.2013",
      type: "a Quote in",
      category: "Life",
      content: (
        <Quote
          text="Once you make a decision, the universe conspires to make it happen."
          author="Ralph Waldo Emerson"
          source="Source"
        />
      ),
    },
  ];

  const pills = [
    { name: "Life", count: 3 },
    { name: "People", count: 1 },
    { name: "Product", count: 1 },
    { name: "UX", count: 1 },
  ];

  return (
    <Layout activeNav="home" pageTitle="HOME" isMobile={true}>
      <div style={{ padding: "40px 16px", margin: "0 auto", maxWidth: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "#222", margin: "0 0 24px 0", fontWeight: "bold" }}>
            Alexander Kitov
          </h1>

          {/* Pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {pills.map((pill) => (
              <span key={pill.name} className="ak-pill">
                {pill.name} ({pill.count})
              </span>
            ))}
          </div>
        </div>

        {/* Single-column post stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
          {posts.map((post) => (
            <div key={post.id}>
              <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "bold", color: "#222" }}>{post.date}</span>
                <span style={{ color: "#555" }}>{post.type}</span>
                <a href="#" className="ak-pill">{post.category}</a>
              </div>
              {post.content}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
