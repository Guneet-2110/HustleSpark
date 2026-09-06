"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Zap } from "lucide-react";

interface SlowToastProps {
  isLoading: boolean;
  operationName?: string;
}

export default function SlowToast({ isLoading, operationName = "Operation" }: SlowToastProps) {
  const [stage, setStage] = useState<"hidden" | "stage1" | "stage2">("hidden");

  useEffect(() => {
    if (!isLoading) {
      setStage("hidden");
      return;
    }

    const timer1 = setTimeout(() => {
      setStage("stage1");
    }, 3000);

    const timer2 = setTimeout(() => {
      setStage("stage2");
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isLoading]);

  if (stage === "hidden") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border-2 border-amber-400 text-xs font-bold">
        {stage === "stage1" ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
            <span>Still working on it... 🔄</span>
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Almost done! ⚡</span>
          </>
        )}
      </div>
    </div>
  );
}
