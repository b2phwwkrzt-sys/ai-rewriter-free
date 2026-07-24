import { NextRequest, NextResponse } from "next/server";

const MAX_CHARS = 3000;
const DAILY_LIMIT = 5;
const usage = new Map<string, { day: string; count: number }>();
const allowedTones = new Set(["natural", "professional", "concise", "friendly"]);

function clientId(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

function checkLimit(id: string) {
  const day = new Date().toISOString().slice(0, 10);
  const current = usage.get(id);
  if (!current || current.day !== day) {
    usage.set(id, { day, count: 1 });
    return true;
  }
  if (current.count >= DAILY_LIMIT) return false;
  current.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const tone = allowedTones.has(body.tone) ? body.tone : "natural";

    if (!text) return NextResponse.json({ error: "Text is required." }, { status: 400 });
    if (text.length > MAX_CHARS) return NextResponse.json({ error: `Maximum ${MAX_CHARS} characters.` }, { status: 400 });
    if (!checkLimit(clientId(request))) {
      return NextResponse.json({ error: "Daily free limit reached. Please try again tomorrow." }, { status: 429 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "The service is not configured yet." }, { status: 503 });
import { NextRequest, NextResponse } from "next/server";

const MAX_CHARS = 3000;
const DAILY_LIMIT = 5;
const usage = new Map<string, { day: string; count: number }>();
const allowedTones = new Set(["natural", "professional", "concise", "friendly"]);

function clientId(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

function checkLimit(id: string) {
  const day = new Date().toISOString().slice(0, 10);
  const current = usage.get(id);
  if (!current || current.day !== day) {
    usage.set(id, { day, count: 1 });
    return true;
  }
  if (current.count >= DAILY_LIMIT) return false;
  current.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const tone = allowedTones.has(body.tone) ? body.tone : "natural";

    if (!text) return NextResponse.json({ error: "Text is required." }, { status: 400 });
    if (text.length > MAX_CHARS) return NextResponse.json({ error: `Maximum ${MAX_CHARS} characters.` }, { status: 400 });
    if (!checkLimit(clientId(request))) {
      return NextResponse.json({ error: "Daily free limit reached. Please try again tomorrow." }, { status: 429 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "The service is not configured yet." }, { status: 503 });

    const prompt = [
      `Rewrite the following English text in a ${tone} tone.`,
      "Preserve the original meaning and factual claims.",
      "Do not add commentary, headings, quotation marks, or explanations.",
      "Return only the rewritten text.",
      "",
      text,
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 1200 },
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("Gemini API error", response.status, details.slice(0, 500));
      return NextResponse.json({ error: "The AI service is temporarily unavailable." }, { status: 502 });
    }

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
    if (!output) return NextResponse.json({ error: "No rewrite was returned." }, { status: 502 });

    return NextResponse.json({ text: output });
  } catch (error) {
    console.error("Rewrite request failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "The AI service is temporarily unavailable." }, { status: 502 });
  }
}

    const prompt = [
      `Rewrite the following English text in a ${tone} tone.`,
      "Preserve the original meaning and factual claims.",
      "Do not add commentary, headings, quotation marks, or explanations.",
      "Return only the rewritten text.",
      "",
      text,
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 1200 },
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("Gemini API error", response.status, details.slice(0, 500));
      return NextResponse.json({ error: "The AI service is temporarily unavailable." }, { status: 502 });
    }

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
    if (!output) return NextResponse.json({ error: "No rewrite was returned." }, { status: 502 });

    return NextResponse.json({ text: output });
  } catch (error) {
    console.error("Rewrite request failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "The AI service is temporarily unavailable." }, { status: 502 });
  }
}
