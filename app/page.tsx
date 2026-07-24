"use client";

import { useMemo, useState } from "react";

const MAX_CHARS = 3000;

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [tone, setTone] = useState("natural");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const remaining = useMemo(() => MAX_CHARS - input.length, [input]);

  async function rewrite() {
    const text = input.trim();
    if (!text) {
      setError("Paste some text first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Rewrite failed.");
      setResult(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (result) await navigator.clipboard.writeText(result);
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top"><span>CR</span> ClearRewrite</a>
        <a className="navLink" href="#how-it-works">How it works</a>
      </nav>

      <section className="hero" id="top">
        <p className="eyebrow">FREE AI WRITING TOOL</p>
        <h1>Say it clearly.<br /><em>Keep it human.</em></h1>
        <p className="subtitle">Rewrite English text for clarity, flow, and tone—without changing your meaning.</p>
      </section>

      <section className="workspace" aria-label="AI rewriter">
        <div className="editorCard">
          <div className="cardHeader">
            <label htmlFor="source">Your text</label>
            <span className={remaining < 0 ? "over" : ""}>{input.length} / {MAX_CHARS}</span>
          </div>
          <textarea
            id="source"
            value={input}
            maxLength={MAX_CHARS}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste an email, paragraph, product description, or article excerpt..."
          />
          <div className="controls">
            <label htmlFor="tone">Tone</label>
            <select id="tone" value={tone} onChange={(event) => setTone(event.target.value)}>
              <option value="natural">Natural</option>
              <option value="professional">Professional</option>
              <option value="concise">Concise</option>
              <option value="friendly">Friendly</option>
            </select>
            <button className="primary" disabled={loading || !input.trim()} onClick={rewrite}>
              {loading ? "Rewriting…" : "Rewrite text"}
            </button>
          </div>
        </div>

        <div className="resultCard">
          <div className="cardHeader">
            <span>Rewritten version</span>
            <button className="copy" onClick={copyResult} disabled={!result}>Copy</button>
          </div>
          <div className="result" aria-live="polite">
            {error ? <p className="error">{error}</p> : result || "Your improved text will appear here."}
          </div>
        </div>
      </section>

      <p className="privacy">Your API key stays on the server. Text is sent only when you click “Rewrite text.”</p>

      <section className="steps" id="how-it-works">
        <div><b>01</b><h2>Paste</h2><p>Add up to 3,000 characters.</p></div>
        <div><b>02</b><h2>Choose</h2><p>Select the tone you need.</p></div>
        <div><b>03</b><h2>Polish</h2><p>Copy the rewritten result.</p></div>
      </section>

      <section className="cta">
        <p>Need a complete article or product page?</p>
        <h2>Get custom content written for your brand.</h2>
        <div className="ctaLinks">
          <a href="http://www.fiverr.com/s/AyxBGaX" target="_blank" rel="noreferrer">SEO articles</a>
          <a href="http://www.fiverr.com/s/Ldae0vj" target="_blank" rel="noreferrer">Product descriptions</a>
        </div>
      </section>
    </main>
  );
}

