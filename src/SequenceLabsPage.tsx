import { useEffect, useState } from "react";
import { buildLevels, hackQuestions, principles, prototypes } from "./sequenceLabsContent";
import type { LabsPrototype, LabsQuestion } from "./sequenceLabsContent";
import "./SequenceLabsPage.css";
import "./SequenceLabsSections.css";
import "./SequenceLabsCards.css";
import "./SequenceLabsResponsive.css";

function formatClock(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-GB", { hour12: false });
  return `${day} ${month} ${year}, ${time}`;
}

function SequenceGlyph() {
  return (
    <span className="sequence-glyph" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => <span key={`sequence-dot-${index}`} />)}
    </span>
  );
}

function FixedChrome() {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <a className="labs-back-link" href="https://www.sequencehq.com/" aria-label="Back to Sequence home">
        <SequenceGlyph />
        <span>[ Back to Sequence home ]</span>
      </a>
      <time className="labs-clock">{clock}</time>
      <nav className="labs-side-nav" aria-label="Labs prototypes">
        {prototypes.map((prototype, index) => (
          <a href={`#${prototype.id}`} key={prototype.id}>
            {(index + 1).toString().padStart(2, "0")}
          </a>
        ))}
      </nav>
      <a className="labs-built-by" href="https://www.sequencehq.com/about#open-roles">
        <span>Built by</span>
        <strong>Sequence</strong>
      </a>
    </>
  );
}

function Hero() {
  return (
    <section className="labs-hero" data-testid="labs-hero" aria-label="Sequence Labs hero">
      <img src="/sequence-labs/poster-v2.webp" alt="" />
      <div className="labs-noise" aria-hidden="true" />
      <h1 aria-label="Sequence/LABS">
        <SequenceGlyph />
        <span>Sequence</span>
        <em>/ L A B S</em>
      </h1>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="labs-info-grid" data-testid="labs-about" aria-labelledby="labs-about-heading">
      <div className="labs-about-copy">
        <h2 id="labs-about-heading">About Sequence Labs</h2>
        <p>
          Sequence Labs is where we prototype AI agents. These are prototypes and internal tools, published while we’re
          still building and refining them. Some of these will never see the light of day; some of them will shape the
          future of revenue automation.
        </p>
      </div>
      <div className="labs-how" data-testid="labs-how">
        <h3>How we build Labs</h3>
        <p>LLMs are useful at different levels:</p>
        <NumberedList items={buildLevels} />
        <p>These principles apply across all three levels, and matter more the higher you climb:</p>
        <NumberedList items={principles} />
      </div>
    </section>
  );
}

function NumberedList({ items }: { readonly items: readonly (string | LabsQuestion)[] }) {
  return (
    <ol className="labs-numbered-list">
      {items.map((item, index) => (
        <li key={typeof item === "string" ? item : item.title}>
          <span>{(index + 1).toString().padStart(2, "0")}</span>
          {typeof item === "string" ? (
            <p>{item}</p>
          ) : (
            <p>
              <strong>{item.title}</strong>
              {item.body}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

function PrototypeCard({ prototype }: { readonly prototype: LabsPrototype }) {
  return (
    <section className="labs-card" id={prototype.id} data-testid="labs-prototype-card">
      <div className="labs-card-art">
        <img src={prototype.image} alt={prototype.title} />
      </div>
      <div className="labs-card-copy">
        <p className="labs-meta">
          [ {prototype.status} ] // {prototype.version}
        </p>
        <h2>{prototype.title}</h2>
        <p>{prototype.description}</p>
        <a href={prototype.href}>[ Read more ]</a>
      </div>
    </section>
  );
}

function HackDaySection() {
  return (
    <section className="labs-hack" data-testid="labs-hack-day" aria-labelledby="labs-hack-heading">
      <div>
        <h2 id="labs-hack-heading">March 2026 // HACK DAY</h2>
        <p>
          One day.
          <br />
          Two questions.
          <br />
          Seven prototypes.
        </p>
      </div>
      <div className="labs-hack-copy">
        <p>We wanted to form an opinion on how we’ll build our next generation of agentic capabilities into our tech stack.</p>
        <h3>Our two questions:</h3>
        <NumberedList items={hackQuestions} />
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="labs-cta" data-testid="labs-cta" aria-labelledby="labs-cta-heading">
      <img src="/sequence-labs/poster-v2.webp" alt="" />
      <div className="labs-noise" aria-hidden="true" />
      <div className="labs-cta-copy">
        <h2 id="labs-cta-heading">Join the lab</h2>
        <p>Labs gets sharper when the people who'd actually use these agents push back. Pick your way in.</p>
      </div>
      <div className="labs-cta-links">
        <a href="https://sequencehq.com/book-a-demo">
          <span>See how Sequence agents work with your billing workflows.</span>
          <strong>[ Book a demo ]</strong>
        </a>
        <a href="https://sequencehq.com/">
          <span>Explore the platform behind the agents.</span>
          <strong>[ Explore Sequence ]</strong>
        </a>
      </div>
    </section>
  );
}

export function SequenceLabsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Sequence Labs";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="labs-page" data-testid="sequence-labs-page">
      <FixedChrome />
      <Hero />
      <main>
        <AboutSection />
        <div className="labs-prototypes" data-testid="labs-prototypes">
          {prototypes.map((prototype) => (
            <PrototypeCard prototype={prototype} key={prototype.id} />
          ))}
        </div>
        <HackDaySection />
        <CtaSection />
      </main>
    </div>
  );
}
