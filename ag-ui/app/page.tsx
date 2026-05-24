"use client";

import { useState } from "react";
import Sidebar from "@/components/shell/Sidebar";
import CopilotScreen from "@/components/copilot/CopilotScreen";
import type { WorkspaceId } from "@/lib/types";

export default function Home() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>("exec");
  const [activeRoute, setActiveRoute] = useState<string>("copilot");

  return (
    <div className="app-shell">
      <Sidebar
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
        activeRoute={activeRoute}
        onRouteChange={setActiveRoute}
      />
      <div className="app-main">
        <div className="app-canvas">
          {activeRoute === "copilot" && <CopilotScreen persona={activeWorkspace} />}
          {activeRoute !== "copilot" && (
            <div style={{ padding: 24 }}>
              <p className="eyebrow" style={{ color: "var(--fg-3)" }}>
                {activeRoute} — coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
