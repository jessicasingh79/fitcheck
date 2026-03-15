**FitCheck — AI-powered job fit analyzer**

Know if a job is worth applying to before you write a single word.

🔗 **Live app:** https://fitcheck-ai-job-fit-b1sz.bolt.host/

**What It Does**
FitCheck analyzes your resume against a job description using Claude AI and gives you an honest picture of your chances. Paste in a job posting and your background, and within seconds you get a fit score, a breakdown of your strengths and gaps, and a ready-to-use cover letter.

**Main Features**
- Fit Scoring: Get a 0–100 fit score across three tiers: Your Lane (75+), Stretch (50-74), and Hard No (below 50). Know exactly where you stand and where you fall short before you spend an hour writing a cover letter.
- Cover Letter Generation: Generate a tailored cover letter based on your resume, the job description, and any additional context you provide. Cover letters are saved and accessible from your history at any time — no regenerating.
- Application Dashboard: Track all your scans in one place. See your top matched skill, interview rate, application breakdown, and a history of every role you've analyzed so you can compare and prioritize.
- Tech Stack: LayerTechnologyFrontendReact 18, TypeScript, ViteStylingTailwind CSSIconsLucide ReactDatabaseSupabase (Postgres + Row Level Security)ServerlessSupabase Edge Functions (Deno)AIAnthropic Claude API

**Running Locally**

Prerequisites

Node.js 18+
A Supabase project
An Anthropic API key

_Setup_

Clone the repository and install dependencies:

bashgit clone https://github.com/jessicasingh79/fitcheck.git
cd fitcheck
npm install
```

2. Create a `.env` file at the project root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Add your Anthropic API key to Supabase Edge Function secrets via the Supabase dashboard under **Settings → Edge Functions → Secrets**:
```
ANTHROPIC_API_KEY=your_anthropic_api_key

Apply the database migrations using the Supabase CLI or dashboard.
Deploy the edge functions to your Supabase project.
Start the development server:

bashnpm run dev
