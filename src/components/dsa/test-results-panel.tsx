"use client";

import { Check, X, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface TestResultsPanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
}

export function TestResultsPanel({ result, isRunning }: TestResultsPanelProps) {
  if (isRunning) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Running tests...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Run your code to see test results.
      </div>
    );
  }

  // Error states
  if (result.errorOutput) {
    return (
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-500">
          <AlertCircle className="h-4 w-4" />
          {result.status === "compile_error"
            ? "Compilation Error"
            : result.status === "time_limit"
              ? "Time Limit Exceeded"
              : "Runtime Error"}
        </div>
        <pre className="overflow-x-auto rounded-md bg-red-50 p-3 font-mono text-xs text-red-700 dark:bg-red-900/10 dark:text-red-400">
          {result.errorOutput}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Summary */}
      <div className="mb-3 flex items-center gap-3">
        <span
          className={cn(
            "text-sm font-semibold",
            result.status === "accepted" ? "text-green-500" : "text-red-500"
          )}
        >
          {result.status === "accepted" ? "Accepted" : "Wrong Answer"}
        </span>
        <span className="text-xs text-muted-foreground">
          {result.passedTests}/{result.totalTests} tests passed
        </span>
        {result.runtime !== null && (
          <span className="text-xs text-muted-foreground">
            {result.runtime}ms
          </span>
        )}
      </div>

      {/* Individual test results */}
      <div className="space-y-2">
        {result.results.map((test) => (
          <div
            key={test.index}
            className={cn(
              "rounded-md border p-3 text-sm",
              test.passed
                ? "border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-900/10"
                : "border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/10"
            )}
          >
            <div className="flex items-center gap-2">
              {test.passed ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className="font-medium">
                {test.isHidden ? `Hidden Test ${test.index + 1}` : `Test ${test.index + 1}`}
              </span>
            </div>

            {!test.passed && !test.isHidden && (
              <div className="mt-2 space-y-1 font-mono text-xs">
                {test.error ? (
                  <p className="text-red-600 dark:text-red-400">
                    Error: {test.error}
                  </p>
                ) : (
                  <>
                    <p>
                      <span className="text-muted-foreground">Expected: </span>
                      {test.expected}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Actual: </span>
                      {test.actual}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
