"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ProblemDescription } from "./problem-description";
import { TestResultsPanel } from "./test-results-panel";
import { Play, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CodeEditorPanel = dynamic(
  () =>
    import("@/components/dsa/code-editor-panel").then(
      (m) => m.CodeEditorPanel
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading editor...
      </div>
    ),
  }
);

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestResult {
  index: number;
  passed: boolean;
  actual?: string;
  expected?: string;
  error?: string;
  isHidden: boolean;
}

interface ExecutionResult {
  status: string;
  results: TestResult[];
  passedTests: number;
  totalTests: number;
  runtime: number | null;
  memory: number | null;
  errorOutput: string | null;
}

interface ProblemData {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  examples: Example[];
  constraints: string[];
  starterCode: Record<string, string>;
  hints: string[];
  category: { name: string; slug: string };
  progress: {
    status: string;
    attempts: number;
    lastLanguage: string | null;
    lastCode: string | null;
  } | null;
}

interface ProblemViewProps {
  slug: string;
}

export function ProblemView({ slug }: ProblemViewProps) {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [code, setCode] = useState("");
  const [language] = useState("python");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await fetch(`/api/dsa/problems/${slug}`);
        if (res.ok) {
          const data: ProblemData = await res.json();
          setProblem(data);

          // Use saved code if available, otherwise use starter code
          if (data.progress?.lastCode) {
            setCode(data.progress.lastCode);
          } else {
            setCode(data.starterCode[language] || "");
          }
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [slug, language]);

  // Auto-save draft code
  const saveCode = useCallback(
    (newCode: string) => {
      if (!problem) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        await fetch(`/api/dsa/progress/${problem.id}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: newCode, language }),
        });
      }, 2000);
    },
    [problem, language]
  );

  function handleCodeChange(newCode: string) {
    setCode(newCode);
    saveCode(newCode);
  }

  async function handleRun() {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fetch(`/api/dsa/problems/${slug}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      if (res.ok) {
        setResult(await res.json());
      } else {
        const err = await res.json();
        setResult({
          status: "runtime_error",
          results: [],
          passedTests: 0,
          totalTests: 0,
          runtime: null,
          memory: null,
          errorOutput: err.error || "Failed to run code",
        });
      }
    } catch {
      setResult({
        status: "runtime_error",
        results: [],
        passedTests: 0,
        totalTests: 0,
        runtime: null,
        memory: null,
        errorOutput: "Network error — failed to reach server",
      });
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/dsa/problems/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      if (res.ok) {
        setResult(await res.json());
      } else {
        const err = await res.json();
        setResult({
          status: "runtime_error",
          results: [],
          passedTests: 0,
          totalTests: 0,
          runtime: null,
          memory: null,
          errorOutput: err.error || "Failed to submit code",
        });
      }
    } catch {
      setResult({
        status: "runtime_error",
        results: [],
        passedTests: 0,
        totalTests: 0,
        runtime: null,
        memory: null,
        errorOutput: "Network error — failed to reach server",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Problem not found.</p>
        <Link href="/dsa" className="text-sm text-primary hover:underline">
          Back to problems
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <Link
          href="/dsa"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Problems
        </Link>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Run
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Submit
          </Button>
        </div>
      </div>

      {/* Split pane */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {/* Left: Problem description */}
        <ResizablePanel defaultSize={40} minSize={25}>
          <ProblemDescription
            title={problem.title}
            difficulty={problem.difficulty}
            description={problem.description}
            examples={problem.examples}
            constraints={problem.constraints}
            hints={problem.hints}
            category={problem.category}
            slug={slug}
            userCode={code}
            testResults={result}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Editor + Results */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <ResizablePanelGroup orientation="vertical">
            {/* Code editor */}
            <ResizablePanel defaultSize={65} minSize={30}>
              <CodeEditorPanel
                code={code}
                language={language}
                onChange={handleCodeChange}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Test results */}
            <ResizablePanel defaultSize={35} minSize={15}>
              <div className="h-full overflow-y-auto border-t">
                <TestResultsPanel
                  result={result}
                  isRunning={isRunning || isSubmitting}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
