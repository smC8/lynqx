import { Worker, NativeConnection } from "@temporalio/worker";
import * as activities from "./activities";

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE ?? "copilot-agents";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

async function main() {
  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });

  const worker = await Worker.create({
    connection,
    taskQueue: TASK_QUEUE,
    workflowsPath: require.resolve("./workflows"),
    activities: { ...activities, APP_URL },
  });

  console.log(`[worker] Connected to ${TEMPORAL_ADDRESS}, listening on queue "${TASK_QUEUE}"`);
  await worker.run();
}

main().catch((err) => {
  console.error("[worker] Fatal:", err);
  process.exit(1);
});
