"use client";

import { CopilotKit } from "@copilotkit/react-core";

export default function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false}>
        {children}
      </CopilotKit>
      {/* Hide CopilotKit's floating web inspector button */}
      <style>{`cpk-web-inspector { display: none !important; }`}</style>
    </>
  );
}
