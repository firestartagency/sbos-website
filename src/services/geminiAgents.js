import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai = null;
const getAI = () => {
    if (!ai) {
        if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
            throw new Error('Gemini API key not configured. Add your key to .env as VITE_GEMINI_API_KEY');
        }
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};

/* ─────────────────────────────────────────────────
   PROMPT TEMPLATES — one per agent
─────────────────────────────────────────────────*/

const PROMPTS = {
    diagnostic: (data) => `You are a business operations analyst. Analyze this small business and produce a comprehensive health diagnostic.

BUSINESS DATA:
- Company: ${data.companyName}
- Team size: ${data.teamSize}
- Revenue range: ${data.revenueRange}
- Goals: ${data.goals?.join(', ') || 'Not specified'}
- Biggest bottleneck: ${data.bottleneck || 'Not specified'}

FINANCIAL DATA:
${data.financialData || 'Not provided'}

TOOLS & SUBSCRIPTIONS:
${data.toolList || 'Not provided'}

KEY PROCESSES:
${data.processes?.filter(Boolean).map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Not provided'}

FOLLOW-UP PROCESS:
${data.followUp || 'Not provided'}

LEAD SOURCES: ${data.leadSources?.join(', ') || 'Not specified'}

RESPOND WITH ONLY VALID JSON (no markdown, no code fences) matching this exact schema:
{
  "overallScore": <number 0-100>,
  "categories": [
    {
      "name": "Operations",
      "score": <number 0-100>,
      "status": "<stable|at-risk|critical>",
      "insight": "<one sentence insight>"
    },
    {
      "name": "Finance Visibility",
      "score": <number 0-100>,
      "status": "<stable|at-risk|critical>",
      "insight": "<one sentence insight>"
    },
    {
      "name": "Growth Readiness",
      "score": <number 0-100>,
      "status": "<stable|at-risk|critical>",
      "insight": "<one sentence insight>"
    },
    {
      "name": "Process Maturity",
      "score": <number 0-100>,
      "status": "<stable|at-risk|critical>",
      "insight": "<one sentence insight>"
    },
    {
      "name": "Team Alignment",
      "score": <number 0-100>,
      "status": "<stable|at-risk|critical>",
      "insight": "<one sentence insight>"
    }
  ],
  "quickWins": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>"],
  "risks": ["<identified risk 1>", "<identified risk 2>", "<identified risk 3>"]
}

Score fairly based on what you see. Be specific in insights — reference their actual tools, processes, and data. Quick wins should include dollar estimates where possible.`,

    moneyLeaks: (data) => `You are a cost optimization specialist. Analyze this business's spending to find waste, duplicates, and savings opportunities.

BUSINESS DATA:
- Company: ${data.companyName}
- Team size: ${data.teamSize}
- Revenue range: ${data.revenueRange}

FINANCIAL DATA (every expense/payment):
${data.financialData || 'Not provided'}

TOOLS & SUBSCRIPTIONS (every tool):
${data.toolList || 'Not provided'}

INSTRUCTIONS:
1. Identify duplicate tools (two tools doing the same job)
2. Flag underutilized subscriptions
3. Find overlapping features between tools
4. Calculate specific dollar savings for each leak
5. Categorize all spending

RESPOND WITH ONLY VALID JSON (no markdown, no code fences) matching this exact schema:
{
  "totalMonthlySpend": <number>,
  "potentialSavings": <number>,
  "leaks": [
    {
      "type": "<duplicate|underutilized|overlap>",
      "tools": ["<tool1 ($XX/mo)>", "<tool2 ($XX/mo)>"],
      "tool": "<for underutilized: single tool name>",
      "monthlyCost": <number, for underutilized>,
      "usage": "<for underutilized: usage description>",
      "category": "<category name>",
      "severity": "<critical|high|moderate|low>",
      "recommendation": "<specific action to take>",
      "monthlySavings": <number>
    }
  ],
  "spendByCategory": [
    { "category": "<name>", "amount": <number>, "tools": <count> }
  ]
}

For "duplicate" leaks, include "tools" array. For "underutilized", include "tool", "monthlyCost", "usage". Always include monthlySavings. Be specific with dollar amounts.`,

    sopBuilder: (data) => `You are an operations consultant specializing in process documentation. Generate 3 structured Standard Operating Procedures (SOPs) from the business processes described below.

BUSINESS DATA:
- Company: ${data.companyName}
- Team size: ${data.teamSize}

TOOLS AVAILABLE:
${data.toolList || 'Not provided'}

PROCESSES DESCRIBED BY USER:
${data.processes?.filter(Boolean).map((p, i) => `Process ${i + 1}: ${p}`).join('\n\n') || 'Not provided'}

INSTRUCTIONS:
1. Generate exactly 3 SOPs from the described processes
2. Each SOP should have 4-6 numbered steps
3. Assign realistic owners (Sales, Operations, Account Manager, Finance, Admin)
4. Reference the actual tools the business uses
5. Include timing expectations for each step
6. Add practical notes where helpful

RESPOND WITH ONLY VALID JSON (no markdown, no code fences) matching this exact schema:
{
  "sops": [
    {
      "title": "<SOP title>",
      "version": "1.0",
      "owner": "<primary owner role>",
      "frequency": "<when this runs, e.g. Per new client, Weekly, Monthly>",
      "estimatedTime": "<e.g. 45 minutes>",
      "steps": [
        {
          "number": 1,
          "action": "<clear action description>",
          "owner": "<role>",
          "timing": "<when this step should happen>",
          "tools": ["<tool1>", "<tool2>"],
          "notes": "<optional practical tip>"
        }
      ]
    }
  ]
}`,

    leadAutomation: (data) => `You are a sales automation specialist. Design a multi-touch follow-up sequence for this business's lead nurturing.

BUSINESS DATA:
- Company: ${data.companyName}
- Team size: ${data.teamSize}

LEAD SOURCES: ${data.leadSources?.join(', ') || 'Website, Referrals'}
PREFERRED CHANNELS: ${data.channels?.join(', ') || 'email'}
COMMUNICATION TONE: ${data.tone || 'friendly'}

CURRENT FOLLOW-UP PROCESS:
${data.followUp || 'Manual follow-up, inconsistent'}

PROCESSES (for context on what they sell):
${data.processes?.filter(Boolean).map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Not provided'}

TOOLS AVAILABLE:
${data.toolList || 'Not provided'}

INSTRUCTIONS:
1. Design a 7-touch follow-up sequence over 21 days
2. Mix channels based on preferences (email, sms, phone)
3. Match the requested tone
4. Write actual message content (subject lines + bodies)
5. Use {{name}} and {{company}} as merge fields
6. Each touch should have a clear purpose

RESPOND WITH ONLY VALID JSON (no markdown, no code fences) matching this exact schema:
{
  "sequenceName": "<descriptive sequence name>",
  "totalDuration": "21 days",
  "touches": [
    {
      "day": <number>,
      "channel": "<email|sms|phone>",
      "type": "<welcome|value|nudge|case-study|direct-ask|last-chance|breakup>",
      "subject": "<for email: subject line>",
      "body": "<full message content with {{name}} merge fields>",
      "purpose": "<short purpose description>"
    }
  ],
  "expectedMetrics": {
    "openRate": "<range, e.g. 45-55%>",
    "replyRate": "<range, e.g. 15-22%>",
    "conversionRate": "<range, e.g. 8-12%>"
  }
}`,

    growthPlan: (data, diagnosticOutput, moneyLeaksOutput) => `You are a business growth strategist. Using the diagnostic scores and money leak findings below, create a prioritized 30/60/90 day operational improvement plan.

BUSINESS DATA:
- Company: ${data.companyName}
- Team size: ${data.teamSize}
- Revenue range: ${data.revenueRange}
- Goals: ${data.goals?.join(', ') || 'Not specified'}
- Bottleneck: ${data.bottleneck || 'Not specified'}

DIAGNOSTIC RESULTS (from Health Diagnostic agent):
${JSON.stringify(diagnosticOutput, null, 2)}

MONEY LEAK FINDINGS (from Money Leak agent):
${JSON.stringify(moneyLeaksOutput, null, 2)}

INSTRUCTIONS:
1. Create a 3-phase plan (30, 60, 90 days) that directly addresses the diagnostic findings and money leaks
2. Phase 1 (30 days): Quick wins, stop the bleeding — focus on the most critical issues
3. Phase 2 (60 days): Optimize systems, build processes
4. Phase 3 (90 days): Scale, automate, grow
5. Each priority should reference which diagnostic issue or money leak it addresses
6. 3-4 priorities per phase

RESPOND WITH ONLY VALID JSON (no markdown, no code fences) matching this exact schema:
{
  "thirtyDay": {
    "theme": "<phase theme, e.g. Foundation — Stop the Bleeding>",
    "priorities": [
      {
        "task": "<specific action item>",
        "effort": "<low|medium|high>",
        "impact": "<low|medium|high>",
        "addressesIssue": "<which diagnostic or money leak finding this fixes>",
        "weekTarget": <number 1-4>
      }
    ]
  },
  "sixtyDay": {
    "theme": "<phase theme>",
    "priorities": [...]
  },
  "ninetyDay": {
    "theme": "<phase theme>",
    "priorities": [...]
  }
}`,
};

/* ─────────────────────────────────────────────────
   CALL GEMINI — parse JSON from response
─────────────────────────────────────────────────*/

async function callGemini(prompt) {
    const genAI = getAI();
    const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    });

    let text = response.text;

    // Strip markdown code fences if Gemini wraps the JSON
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Invalid JSON from Gemini. Raw response: ' + text.substring(0, 200));
    }
}

/* ─────────────────────────────────────────────────
   PUBLIC API — orchestrate all 5 agents
─────────────────────────────────────────────────*/

/**
 * Run all 5 agents against the intake data.
 *
 * @param {Object} intakeData — form data from DemoIntake
 * @param {Function} onModuleComplete — callback(moduleId, data) as each completes
 * @returns {Object} all results keyed by module id
 */
export async function runAnalysis(intakeData, onModuleComplete) {
    const results = {};

    // === PHASE 1: 4 agents in parallel ===
    const phase1 = await Promise.allSettled([
        callGemini(PROMPTS.diagnostic(intakeData))
            .then(data => { results.diagnostic = data; onModuleComplete?.('diagnostic', data); return data; }),

        callGemini(PROMPTS.moneyLeaks(intakeData))
            .then(data => { results.moneyLeaks = data; onModuleComplete?.('money-leaks', data); return data; }),

        callGemini(PROMPTS.sopBuilder(intakeData))
            .then(data => { results.sops = data; onModuleComplete?.('sop-builder', data); return data; }),

        callGemini(PROMPTS.leadAutomation(intakeData))
            .then(data => { results.leadAutomation = data; onModuleComplete?.('lead-auto', data); return data; }),
    ]);

    // Log any Phase 1 failures
    phase1.forEach((result, idx) => {
        if (result.status === 'rejected') {
            const names = ['diagnostic', 'moneyLeaks', 'sopBuilder', 'leadAutomation'];
            console.error(`Agent ${names[idx]} failed:`, result.reason);
        }
    });

    // === PHASE 2: Growth Plan (needs diagnostic + money leaks) ===
    if (results.diagnostic && results.moneyLeaks) {
        try {
            const growthPlan = await callGemini(
                PROMPTS.growthPlan(intakeData, results.diagnostic, results.moneyLeaks)
            );
            results.growthPlan = growthPlan;
            onModuleComplete?.('growth-plan', growthPlan);
        } catch (e) {
            console.error('Growth Plan agent failed:', e);
        }
    } else {
        console.warn('Skipping Growth Plan — diagnostic or money leaks failed');
    }

    return results;
}

/**
 * Check if the API key is configured.
 */
export function isApiKeyConfigured() {
    return API_KEY && API_KEY !== 'your_gemini_api_key_here';
}
