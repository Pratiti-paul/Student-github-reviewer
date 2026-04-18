<!DOCTYPE html>
<html>

<body>

<h1>RepoInsight</h1>

<p>
<b>RepoInsight</b> is an AI-powered GitHub portfolio analyzer that evaluates a developer’s profile like a recruiter. 
It provides structured insights on projects, strengths, weaknesses, tech stack, and hireability using LLM-driven analysis and GitHub data.
</p>

<hr>

<h2>Features</h2>

<ul>
    <li><b>GitHub Analysis:</b> Analyze any public GitHub username</li>
    <li><b>AI-Powered Review:</b> Recruiter-style feedback with strengths & weaknesses</li>
    <li><b>Project Insights:</b> Structured breakdown of repositories</li>
    <li><b>Visual Analytics:</b> Contribution heatmap & language distribution chart</li>
    <li><b>Shareable Reports:</b> Unique URLs like /review/[username]</li>
    <li><b>Fast Performance:</b> Cached responses for quick loading</li>
</ul>

<hr>

<h2>Tech Stack</h2>

<h3>Frontend</h3>
<ul>
    <li>Next.js</li>
    <li>TypeScript</li>
    <li>Tailwind CSS</li>
    <li>Axios</li>
    <li>Recharts</li>
</ul>

<h3>Backend</h3>
<ul>
    <li>FastAPI</li>
    <li>LangChain + Groq</li>
    <li>Python Requests</li>
</ul>

<h3>APIs Used</h3>
<ul>
    <li>GitHub REST API</li>
    <li>GitHub GraphQL API</li>
</ul>

<hr>

<h2>Core Functional Modules</h2>

<ul>
    <li><b>Portfolio Analysis Engine:</b> Fetches and filters repositories</li>
    <li><b>AI Review System:</b> Generates structured insights</li>
    <li><b>Caching Layer:</b> Avoids repeated API calls</li>
</ul>

<hr>

<h2>Project Structure</h2>

<pre>
RepoInsight/
├── agent/
│   ├── nodes.py
│   ├── graph.py
│   ├── state.py
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── review/
│   │   │   └── [username]/
│   │   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── KPIcards.tsx
│   │   ├── Projects.tsx
│   │   ├── Insights.tsx
│   │   ├── Loader.tsx
│   │   ├── ContributionHeatmap.tsx
│   │   ├── LanguageChart.tsx
│
├── main.py
├── requirements.txt
└── README.md
</pre>

<hr>

<h2>API Endpoints</h2>

<table border="1" cellpadding="6">
<tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
</tr>
<tr>
    <td>POST</td>
    <td>/review</td>
    <td>Analyze GitHub profile</td>
</tr>
<tr>
    <td>GET</td>
    <td>/review/{username}</td>
    <td>Fetch cached review</td>
</tr>
</table>

<hr>

<h2>📊 API Response Structure</h2>

<pre>
{
  "projects": [],
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [],
  "overall_assessment": {
    "level": "Strong / Good / Average / Weak",
    "summary": "..."
  },
  "contribution_heatmap": {},
  "language_distribution": []
}
</pre>

<hr>

<h2>Edge Case Handling</h2>

<ul>
    <li>Invalid GitHub username → Returns error</li>
    <li>No repositories → Shows fallback UI</li>
    <li>API rate limits → Graceful handling</li>
</ul>

<hr>

<h2>Environment Variables</h2>

<pre>
GITHUB_TOKEN=your_github_token
GROQ_API_KEY=your_groq_api_key
</pre>

<hr>

<h2>Local Development</h2>

<h3>Backend</h3>

<pre>
pip install -r requirements.txt
uvicorn main:app --reload
</pre>

<p>Runs on: http://127.0.0.1:8000</p>

<h3>Frontend</h3>

<pre>
cd frontend
npm install
npm run dev
</pre>

<p>Runs on: http://localhost:3000</p>

<hr>

<h2>How It Works</h2>

<ol>
    <li>User enters GitHub username</li>
    <li>Backend fetches repositories</li>
    <li>Data is processed and sent to AI</li>
    <li>AI generates insights</li>
    <li>Results are cached</li>
    <li>Dashboard displays analysis</li>
</ol>

<hr>

<h2>Future Improvements</h2>

<ul>
    <li>Resume generation from GitHub</li>
    <li>Leaderboard of developers</li>
    <li>AI interview readiness score</li>
    <li>LinkedIn integration</li>
</ul>

<hr>

<h2>Disclaimer</h2>

<p>
This project is intended for educational and demonstration purposes only. 
AI evaluations are indicative and not a substitute for real hiring decisions.
</p>

<hr>

<h2>Made with ❤️ by Pratiti Paul</h2>

</body>
</html>
