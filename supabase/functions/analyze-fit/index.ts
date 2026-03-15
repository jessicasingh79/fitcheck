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
    const { jobDescription, resume, additionalContext } = await req.json();

    if (!jobDescription || !resume) {
      return new Response(
        JSON.stringify({ error: "Both jobDescription and resume are required" }),
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

    const prompt = `You are a senior hiring manager and blunt career advisor. Analyze the fit between this resume and job description using the following three-step process. No encouragement padding. No softening. Write directly to the applicant — use "you/your" throughout.

JOB DESCRIPTION:
${jobDescription}

RESUME / BACKGROUND:
${resume}${additionalContext ? `\n\nADDITIONAL CONTEXT (provided by the applicant — treat as supplementary to the resume):\n${additionalContext}` : ""}

EVALUATION PROCESS:

Step 1 — Hard No check. First, determine if the role requires skills or background that are fundamentally absent — for example: a software engineering role for someone with no engineering background, a role requiring a PhD when you have none, a clinical or licensed role when you have no licensure. If this is a fundamental mismatch, score below 40 and make it clear in the gaps. Do not proceed to detailed analysis — one clear reason is sufficient.

Step 2 — Role scan. If not a Hard No, identify: what type of role is this? What are the 3-5 non-negotiable requirements? What is nice-to-have vs. required?

Step 3 — Score against these tiers:
- Hard No (below 50): Fundamental mismatch. You are missing core requirements that cannot be easily bridged. Don't waste your time applying.
- Stretch (50-74): Real gaps exist but transferable skills are present. Viable only if you are genuinely interested — you must be prepared to address gaps head-on.
- Your Lane (75+): Strong match. What you lack, you can learn or compensate for with your existing strengths.

Respond ONLY with valid JSON in this exact structure, no other text:
{
  "fitScore": <integer 0-100>,
  "strengths": [<string>, <string>, <string>],
  "gaps": [<string>, <string>, <string>],
  "pitch": "<one sharp, specific sentence you could open a cover letter or interview with — grounded in what you actually bring. If the fit is weak, make it honest about the angle you could credibly take, not a spin.>"
}

Be specific — reference actual skills, experiences, and requirements from both texts. No vague filler. No generic statements.`;

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
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeResponse = await response.json();
    const content = claudeResponse.content?.[0]?.text;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Empty response from AI" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    return new Response(JSON.stringify(parsed), {
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
