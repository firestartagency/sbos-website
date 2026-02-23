import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai = null;
const getAI = () => {
    if (!ai) {
        if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
            throw new Error('Gemini API key not configured');
        }
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};

/**
 * Build the system prompt from intake data + analysis results.
 */
function buildSystemPrompt(intakeData, analysisResults) {
    const parts = [];

    parts.push(`You are the SBOS AI Assistant — a helpful, knowledgeable business advisor for ${intakeData?.companyName || 'this business'}.`);
    parts.push(`You have full access to the user's business data and analysis results. Answer questions clearly and specifically, referencing their actual data. Be concise but actionable. Use plain English.`);
    parts.push(`If asked about something not covered by the data, say so honestly. Don't make up numbers.`);
    parts.push(`Keep responses focused — 2-4 paragraphs max unless they ask for detail. Use bullet points for lists.`);
    parts.push('');

    // Business basics
    parts.push('=== BUSINESS PROFILE ===');
    if (intakeData?.companyName) parts.push(`Company: ${intakeData.companyName}`);
    if (intakeData?.teamSize) parts.push(`Team size: ${intakeData.teamSize}`);
    if (intakeData?.revenueRange) parts.push(`Revenue range: ${intakeData.revenueRange}`);
    if (intakeData?.goals?.length) parts.push(`Goals: ${intakeData.goals.join(', ')}`);
    if (intakeData?.bottleneck) parts.push(`Biggest bottleneck: ${intakeData.bottleneck}`);
    parts.push('');

    // Financial data
    if (intakeData?.financialData) {
        parts.push('=== FINANCIAL DATA ===');
        parts.push(intakeData.financialData);
        parts.push('');
    }

    // Tools
    if (intakeData?.toolList) {
        parts.push('=== TOOLS & SUBSCRIPTIONS ===');
        parts.push(intakeData.toolList);
        parts.push('');
    }

    // Processes
    if (intakeData?.processes?.filter(Boolean).length) {
        parts.push('=== KEY PROCESSES ===');
        intakeData.processes.filter(Boolean).forEach((p, i) => {
            parts.push(`${i + 1}. ${p}`);
        });
        parts.push('');
    }

    // Follow-up
    if (intakeData?.followUp) {
        parts.push('=== CURRENT FOLLOW-UP PROCESS ===');
        parts.push(intakeData.followUp);
        parts.push('');
    }

    // Analysis results
    if (analysisResults) {
        if (analysisResults.diagnostic) {
            parts.push('=== HEALTH DIAGNOSTIC RESULTS ===');
            parts.push(JSON.stringify(analysisResults.diagnostic, null, 2));
            parts.push('');
        }
        if (analysisResults.moneyLeaks || analysisResults['money-leaks']) {
            parts.push('=== MONEY LEAK FINDINGS ===');
            parts.push(JSON.stringify(analysisResults.moneyLeaks || analysisResults['money-leaks'], null, 2));
            parts.push('');
        }
        if (analysisResults.growthPlan || analysisResults['growth-plan']) {
            parts.push('=== GROWTH PLAN ===');
            parts.push(JSON.stringify(analysisResults.growthPlan || analysisResults['growth-plan'], null, 2));
            parts.push('');
        }
        if (analysisResults.sops || analysisResults['sop-builder']) {
            parts.push('=== SOP TEMPLATES ===');
            parts.push(JSON.stringify(analysisResults.sops || analysisResults['sop-builder'], null, 2));
            parts.push('');
        }
        if (analysisResults.leadAutomation || analysisResults['lead-auto']) {
            parts.push('=== LEAD AUTOMATION SEQUENCE ===');
            parts.push(JSON.stringify(analysisResults.leadAutomation || analysisResults['lead-auto'], null, 2));
            parts.push('');
        }
    }

    return parts.join('\n');
}

/**
 * Send a message to the Gemini chat with full business context.
 *
 * @param {string} userMessage — the user's question
 * @param {Array} history — conversation history [{role: 'user'|'assistant', content: '...'}]
 * @param {Object} intakeData — from the intake form
 * @param {Object} analysisResults — from all analysis modules
 * @returns {string} the assistant's response
 */
export async function sendChatMessage(userMessage, history, intakeData, analysisResults) {
    const genAI = getAI();
    const systemPrompt = buildSystemPrompt(intakeData, analysisResults);

    // Build contents array: system instruction + history + new message
    const contents = [];

    // Add conversation history
    for (const msg of history) {
        contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        });
    }

    // Add the new user message
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
    });

    const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents,
        config: {
            systemInstruction: systemPrompt,
        },
    });

    return response.text || 'I wasn\'t able to generate a response. Please try again.';
}
