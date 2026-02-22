"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DifficultyBadge } from "./difficulty-badge";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemDescriptionProps {
  title: string;
  difficulty: string;
  description: string;
  examples: Example[];
  constraints: string[];
  hints: string[];
  category: { name: string; slug: string };
}

export function ProblemDescription({
  title,
  difficulty,
  description,
  examples,
  constraints,
  hints,
}: ProblemDescriptionProps) {
  const [revealedHints, setRevealedHints] = useState(0);

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
      </div>
    </div>
  );
}
