"use client";

import { useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DifficultyBadge } from "./difficulty-badge";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
  Loader2,
} from "lucide-react";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestResults {
  status: string;
  passedTests: number;
  totalTests: number;
  errorOutput: string | null;
}

interface ProblemDescriptionProps {
  title: string;
  difficulty: string;
  description: string;
  examples: Example[];
  constraints: string[];
  hints: string[];
  category: { name: string; slug: string };
  slug?: string;
  userCode?: string;
  testResults?: TestResults | null;
}

export function ProblemDescription({
  title,
  difficulty,
  description,
  examples,
  constraints,
  hints,
  slug,
  userCode,
  testResults,
}: ProblemDescriptionProps) {
  const [revealedHints, setRevealedHints] = useState(0);
  const [aiHints, setAiHints] = useState<string[]>([]);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [hintCooldown, setHintCooldown] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleGetAiHint = useCallback(async () => {
    if (!slug || !userCode || isLoadingHint || hintCooldown) return;

    setIsLoadingHint(true);
    setHintError(null);

    try {
      const res = await fetch("/api/dsa/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          code: userCode,
          language: "python",
          previousAiHints: aiHints,
          testResults: testResults
            ? {
                status: testResults.status,
                passedTests: testResults.passedTests,
                totalTests: testResults.totalTests,
                errorOutput: testResults.errorOutput,
              }
            : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get hint");
      }

      const data = await res.json();
      setAiHints((prev) => {
        setActiveHintIndex(prev.length);
        return [...prev, data.hint];
      });

      // 15-second cooldown
      setHintCooldown(true);
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => setHintCooldown(false), 15000);
    } catch (error) {
      setHintError(
        error instanceof Error ? error.message : "Failed to get hint"
      );
    } finally {
      setIsLoadingHint(false);
    }
  }, [slug, userCode, aiHints, testResults, isLoadingHint, hintCooldown]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Title & difficulty */}
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <div className="mt-2">
            <DifficultyBadge difficulty={difficulty} />
          </div>
        </div>

        {/* Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
        </div>

        {/* Examples */}
        <div className="space-y-4">
          {examples.map((example, i) => (
            <div key={i} className="rounded-lg border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-semibold">Example {i + 1}:</p>
              <div className="space-y-1 font-mono text-sm">
                <p>
                  <span className="text-muted-foreground">Input: </span>
                  {example.input}
                </p>
                <p>
                  <span className="text-muted-foreground">Output: </span>
                  {example.output}
                </p>
                {example.explanation && (
                  <p className="mt-2 font-sans text-muted-foreground">
                    {example.explanation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Constraints:</h3>
          <ul className="space-y-1">
            {constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <code className="text-xs">{c}</code>
              </li>
            ))}
          </ul>
        </div>

        {/* Hints */}
        {hints.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Hints
            </h3>
            <div className="space-y-2">
              {hints.map((hint, i) => (
                <div key={i}>
                  {i < revealedHints ? (
                    <div className="rounded-md border bg-yellow-50 p-3 text-sm dark:bg-yellow-900/10">
                      {hint}
                    </div>
                  ) : i === revealedHints ? (
                    <button
                      onClick={() => setRevealedHints((prev) => prev + 1)}
                      className="flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <ChevronRight className="h-3 w-3" />
                      Reveal Hint {i + 1}
                    </button>
                  ) : null}
                </div>
              ))}
              {revealedHints > 0 && revealedHints >= hints.length && (
                <button
                  onClick={() => setRevealedHints(0)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="h-3 w-3" />
                  Hide hints
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Hints */}
        {slug && userCode && (
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-blue-500" />
              AI Hints
            </h3>
            <div className="space-y-2">
              {aiHints.length > 0 && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-900/10">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <Sparkles className="h-3 w-3" />
                      AI Hint {activeHintIndex + 1}
                    </div>
                    {aiHints.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveHintIndex((i) => i - 1)}
                          disabled={activeHintIndex === 0}
                          className="rounded p-0.5 text-blue-500 hover:bg-blue-100 disabled:opacity-30 dark:hover:bg-blue-900/20"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs text-blue-500 dark:text-blue-400">
                          {activeHintIndex + 1} / {aiHints.length}
                        </span>
                        <button
                          onClick={() => setActiveHintIndex((i) => i + 1)}
                          disabled={activeHintIndex === aiHints.length - 1}
                          className="rounded p-0.5 text-blue-500 hover:bg-blue-100 disabled:opacity-30 dark:hover:bg-blue-900/20"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {aiHints[activeHintIndex]}
                </div>
              )}

              {hintError && (
                <p className="text-xs text-red-500">{hintError}</p>
              )}

              <button
                onClick={handleGetAiHint}
                disabled={isLoadingHint || hintCooldown}
                className="flex items-center gap-1.5 rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/10"
              >
                {isLoadingHint ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {aiHints.length === 0
                      ? "Get AI Hint"
                      : "Get Another AI Hint"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
