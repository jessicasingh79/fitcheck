import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { jobDescription, resume, strengths, gaps, pitch } = await req.json();

    if (!jobDescription || !resume) {
      return new Response(
        JSON.stringify({ error: "jobDescription and resume are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a world-class cover letter writer. Write a compelling, specific, and authentic cover letter for this applicant. Write directly in first person, as if you are the applicant — use "I/my/me" throughout.

JOB DESCRIPTION:
${jobDescription}

RESUME / BACKGROUND:
${resume}

YOUR STRENGTHS FOR THIS ROLE:
${strengths?.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n") ?? ""}

KNOWN GAPS:
${gaps?.map((g: string, i: number) => `${i + 1}. ${g}`).join("\n") ?? ""}

SUGGESTED OPENING ANGLE:
${pitch ?? ""}

INSTRUCTIONS:
- Write a complete, ready-to-send cover letter (3-4 paragraphs)
- Opening paragraph: hook the reader immediately using the suggested pitch angle, grounded in what you actually bring
- Middle paragraph(s): expand on 2-3 specific strengths with concrete evidence from your background; briefly and honestly address any major gap if it's significant, reframing it as an asset or showing awareness
- Closing paragraph: confident call to action
- Tone: direct, confident, human — not corporate boilerplate
- Length: 250-350 words
- Do NOT include placeholder brackets like [Your Name] or [Date] — write the letter as if you will just fill in your name at the bottom
- Do NOT write a subject line or date — just start with "Dear Hiring Manager," or a similar opener
- Do NOT add any preamble or explanation outside the letter itself

Output ONLY the cover letter text, nothing else.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeResponse = await response.json();
    const coverLetter = claudeResponse.content?.[0]?.text;

    if (!coverLetter) {
      return new Response(
        JSON.stringify({ error: "Empty response from AI" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
