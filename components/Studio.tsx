"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { initPersistence, useStudio } from "@/lib/store";
import { readSnapshotFromHash } from "@/lib/share";
import { Toolbar } from "./Toolbar";
import { Canvas } from "./canvas/Canvas";
import { Palette } from "./canvas/Palette";
import { Inspector } from "./canvas/Inspector";
import { CopilotPanel } from "./copilot/CopilotPanel";
import { RequirementsPanel } from "./requirements/RequirementsPanel";

export function Studio() {
  const hydrated = useStudio((s) => s.hydrated);
  const [requirementsOpen, setRequirementsOpen] = useState(true);

  useEffect(() => {
    const shared = readSnapshotFromHash();
    if (shared) {
      // A shared link takes precedence over locally saved state.
      useStudio.getState().loadSnapshot(shared);
      useStudio.setState({ hydrated: true });
    } else {
      void useStudio.getState().hydrate();
    }
    const unsub = initPersistence();
    return () => unsub();
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Toolbar
        onToggleRequirements={() => setRequirementsOpen((v) => !v)}
        requirementsOpen={requirementsOpen}
      />
      <div className="flex min-h-0 flex-1">
        {requirementsOpen ? (
          <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-950">
            <RequirementsPanel />
          </aside>
        ) : null}

        <main className="relative min-w-0 flex-1 bg-zinc-50 dark:bg-zinc-900">
          {!hydrated ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              Loading…
            </div>
          ) : (
            <ReactFlowProvider>
              <Canvas />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
                <div className="pointer-events-auto max-w-full overflow-x-auto rounded-xl border border-zinc-200 bg-white/90 p-2 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
                  <Palette />
                </div>
              </div>
              <div className="pointer-events-none absolute right-3 top-16 z-10 w-64">
                <div className="pointer-events-auto rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                  <Inspector />
                </div>
              </div>
            </ReactFlowProvider>
          )}
        </main>

        <aside className="hidden w-[360px] shrink-0 border-l border-zinc-200 bg-white lg:block dark:border-zinc-800 dark:bg-zinc-950">
          <CopilotPanel />
        </aside>
      </div>
    </div>
  );
}
