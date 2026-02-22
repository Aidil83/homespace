"use client";

import { Check, Circle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIconProps {
  status: string;
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  switch (status) {
    case "solved":
      return (
        <Check
          className={cn("h-4 w-4 text-green-500", className)}
        />
      );
    case "attempted":
      return (
        <Minus
          className={cn("h-4 w-4 text-yellow-500", className)}
        />
      );
    default:
      return (
        <Circle
          className={cn("h-4 w-4 text-muted-foreground/30", className)}
        />
      );
  }
}
