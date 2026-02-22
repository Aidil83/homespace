import { SUPPORTED_LANGUAGES } from "./languages";

const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL || "https://judge0-ce.p.sulu.sh";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

interface TestCase {
  input: unknown[];
  expectedOutput: unknown;
  isHidden: boolean;
}

interface JudgeSubmission {
  token: string;
}

interface JudgeResult {
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
}

export interface TestResult {
  index: number;
  passed: boolean;
  actual?: string;
  expected?: string;
  error?: string;
  isHidden: boolean;
}

export interface ExecutionResult {
  status: "accepted" | "wrong_answer" | "runtime_error" | "time_limit" | "compile_error";
  results: TestResult[];
  passedTests: number;
  totalTests: number;
  runtime: number | null;
  memory: number | null;
  errorOutput: string | null;
}

function buildPythonWrapper(
  userCode: string,
  functionName: string,
  testCases: TestCase[]
): string {
  const serializedTests = JSON.stringify(
    testCases.map((tc) => ({
      input: tc.input,
      expected: tc.expectedOutput,
    }))
  );

  return `
from __future__ import annotations
import json, sys, math

${userCode}

_test_cases = json.loads('${serializedTests.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}')
_results = []
_sol = Solution()

for _i, _tc in enumerate(_test_cases):
    try:
        _args = _tc["input"]
        _expected = _tc["expected"]
        _actual = _sol.${functionName}(*_args)
        # Handle list comparison with sorting for order-independent results
        if isinstance(_actual, list) and isinstance(_expected, list):
            if len(_actual) > 0 and isinstance(_actual[0], list):
                _passed = sorted([sorted(x) if isinstance(x, list) else x for x in _actual]) == sorted([sorted(x) if isinstance(x, list) else x for x in _expected])
            else:
                _passed = _actual == _expected
        else:
            _passed = _actual == _expected
        _results.append({"index": _i, "passed": _passed, "actual": repr(_actual), "expected": repr(_expected)})
    except Exception as _e:
        _results.append({"index": _i, "passed": False, "error": str(_e)})

print(json.dumps(_results))
`.trim();
}

export function buildWrapper(
  userCode: string,
  language: string,
  functionName: string,
  testCases: TestCase[]
): string {
  switch (language) {
    case "python":
      return buildPythonWrapper(userCode, functionName, testCases);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

async function judge0Fetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (JUDGE0_API_KEY) {
    headers["X-Auth-Token"] = JUDGE0_API_KEY;
  }

  return fetch(`${JUDGE0_API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

export async function submitToJudge0(
  sourceCode: string,
  language: string
): Promise<string> {
  const langConfig = SUPPORTED_LANGUAGES[language];
  if (!langConfig) throw new Error(`Unsupported language: ${language}`);

  const res = await judge0Fetch("/submissions?base64_encoded=false&wait=false", {
    method: "POST",
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: langConfig.id,
      cpu_time_limit: 5,
      memory_limit: 128000,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge0 submission failed: ${res.status} ${text}`);
  }

  const data: JudgeSubmission = await res.json();
  return data.token;
}

export async function pollJudge0Result(
  token: string,
  maxAttempts = 20,
  intervalMs = 1000
): Promise<JudgeResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await judge0Fetch(
      `/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr,compile_output,time,memory`
    );

    if (!res.ok) {
      throw new Error(`Judge0 poll failed: ${res.status}`);
    }

    const result: JudgeResult = await res.json();

    // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, etc.
    if (result.status.id > 2) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Judge0 execution timed out waiting for results");
}

export function parseJudge0Result(
  judgeResult: JudgeResult,
  testCases: TestCase[]
): ExecutionResult {
  // Compile error
  if (judgeResult.status.id === 6) {
    return {
      status: "compile_error",
      results: [],
      passedTests: 0,
      totalTests: testCases.length,
      runtime: null,
      memory: null,
      errorOutput: judgeResult.compile_output || "Compilation error",
    };
  }

  // Time limit exceeded (status 5)
  if (judgeResult.status.id === 5) {
    return {
      status: "time_limit",
      results: [],
      passedTests: 0,
      totalTests: testCases.length,
      runtime: null,
      memory: null,
      errorOutput: "Time Limit Exceeded",
    };
  }

  // Try to parse stdout as JSON test results
  if (judgeResult.stdout) {
    try {
      const rawResults: Array<{
        index: number;
        passed: boolean;
        actual?: string;
        expected?: string;
        error?: string;
      }> = JSON.parse(judgeResult.stdout.trim());

      const results: TestResult[] = rawResults.map((r) => ({
        ...r,
        isHidden: testCases[r.index]?.isHidden ?? false,
      }));

      const passedTests = results.filter((r) => r.passed).length;

      return {
        status: passedTests === results.length ? "accepted" : "wrong_answer",
        results,
        passedTests,
        totalTests: results.length,
        runtime: judgeResult.time ? Math.round(parseFloat(judgeResult.time) * 1000) : null,
        memory: judgeResult.memory,
        errorOutput: null,
      };
    } catch {
      // stdout wasn't valid JSON — treat as runtime error
    }
  }

  return {
    status: "runtime_error",
    results: [],
    passedTests: 0,
    totalTests: testCases.length,
    runtime: null,
    memory: null,
    errorOutput:
      judgeResult.stderr || judgeResult.stdout || "Runtime error occurred",
  };
}

export async function executeCode(
  userCode: string,
  language: string,
  functionName: string,
  testCases: TestCase[]
): Promise<ExecutionResult> {
  const wrappedCode = buildWrapper(userCode, language, functionName, testCases);
  const token = await submitToJudge0(wrappedCode, language);
  const judgeResult = await pollJudge0Result(token);
  return parseJudge0Result(judgeResult, testCases);
}
