const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface HintContext {
  problemTitle: string;
  problemDescription: string;
  userCode: string;
  language: string;
  staticHints: string[];
  previousAiHints: string[];
  testResults?: {
    status: string;
    passedTests: number;
    totalTests: number;
    errorOutput: string | null;
  } | null;
}

function buildPrompt(context: HintContext): string {
  const hintNumber = context.previousAiHints.length + 1;

  let levelInstruction: string;
  if (hintNumber === 1) {
    levelInstruction =
      "Give a VAGUE, high-level hint. Only mention the general category of approach (e.g. 'think about using a hash-based structure' or 'consider a two-pointer technique'). Do NOT name specific methods, variables, or steps. Just point them in the right direction.";
  } else if (hintNumber === 2) {
    levelInstruction =
      "Give a MODERATE hint. Name the specific data structure or algorithm they should use, and describe the general strategy in 1-2 steps. You can say things like 'use a dictionary to map values to indices' but do NOT write any code or pseudocode.";
  } else if (hintNumber === 3) {
    levelInstruction =
      "Give a DETAILED hint. Break down the approach into concrete steps. Reference specific parts of their code that need changing. You can use pseudocode-like descriptions but still do NOT write the actual solution code.";
  } else {
    levelInstruction =
      "Give the MOST SPECIFIC hint possible. Walk them through the exact logic step by step, reference exact lines in their code, and describe precisely what to write. You may include small code snippets for the trickiest part, but do NOT give the complete solution.";
  }

  let prompt = `You are a helpful DSA tutor. A student is working on a coding problem and needs a hint.

PROBLEM: ${context.problemTitle}
${context.problemDescription}

STUDENT'S CODE (${context.language}):
\`\`\`${context.language}
${context.userCode}
\`\`\``;

  if (context.staticHints.length > 0) {
    prompt += `\n\nSTATIC HINTS ALREADY AVAILABLE:\n${context.staticHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;
  }

  if (context.previousAiHints.length > 0) {
    prompt += `\n\nPREVIOUS AI HINTS YOU ALREADY GAVE (do NOT repeat these):\n${context.previousAiHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;
  }

  if (context.testResults) {
    prompt += `\n\nTEST RESULTS: ${context.testResults.passedTests}/${context.testResults.totalTests} tests passing. Status: ${context.testResults.status}.`;
    if (context.testResults.errorOutput) {
      prompt += `\nError: ${context.testResults.errorOutput}`;
    }
  }

  prompt += `\n\nThis is hint #${hintNumber}. ${levelInstruction}

RULES:
- Keep your response under 3 sentences.
- Do NOT give the full solution code.
- Do NOT repeat information from static hints or previous AI hints.
- If test results are provided, reference specific failures to guide the student.
- Be concise and direct. Vary your opening — do NOT start with generic phrases like "Great start!" or "Good job!".`;

  return prompt;
}

export async function generateHint(context: HintContext): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = buildPrompt(context);

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        "AI hint rate limit reached. Please wait a moment and try again."
      );
    }
    throw new Error("Failed to generate AI hint. Please try again later.");
  }

  const data = await res.json();
  const hint =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;

  if (!hint) {
    throw new Error("No hint generated from Gemini API");
  }

  return hint;
}
