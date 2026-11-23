# n8n-nodes-insightshub

n8n community node that reports workflow executions to **InsightsHub**, the dashboard that tracks AI spend, chats, categories and workflow health per client.

It adds one node, **InsightsHub: Report Execution**, and two credentials.

## Credentials

| Credential | Used for |
| --- | --- |
| **Insightshub API** | Base URL of the InsightsHub backend and the collector token (`x-insighthub-token`). Always required. |
| **Insightshub N8n API** | Base URL and API key of this n8n instance. Native mode uses it to read the full execution from the n8n API. |

## Payload modes

- **Native n8n execution (recommended).** The node reads the execution from the n8n API and sends it as n8n stored it. InsightsHub extracts nodes, AI usage (model, tokens, one request per model call), tool calls, errors and the conversation. The workflow must have **Save execution progress** enabled.
- **Structured.** You build the payload from parameters (status, duration, AI usage JSON, nodes, errors). Use it only when the native mode is not possible.

## Recommended setup

### 1. At the end of each chat workflow

Add the node as the **last node**, after the response is sent:

- Payload Mode: `Native n8n Execution`
- Execution to Report: `This Execution`
- Project ID: `{{ $workflow.id }}`
- Project Name: `{{ $workflow.name }}`
- Settings → On Error: `Continue (using regular output)`, so a reporting problem never breaks the bot.

The node sends the execution while it is still running, so it closes the snapshot itself: success unless the execution already has an error.

### 2. In the shared Error Workflow

Executions that fail before reaching the last node are never reported from inside the workflow. To report them, add a second node after the **Error Trigger** of the Error Workflow:

- Payload Mode: `Native n8n Execution`
- Execution to Report: `Failed Execution (Error Workflow)`
- Execution ID: `{{ $json.execution.id }}` (default)
- Project ID: `{{ $json.workflow.id }}`
- Project Name: `{{ $json.workflow.name }}`
- Settings → On Error: `Continue (using regular output)`

In this mode the node sends the failed execution with its real final status. InsightsHub keeps it only if the workflow is already tracked: a project that already reported, or a workflow selected for a client. It answers `skipped: UNTRACKED_WORKFLOW` for every other workflow of the instance, so one shared Error Workflow is safe.

## Delivery and retries

Under **Options**:

| Option | Default | What it does |
| --- | --- | --- |
| Timeout (seconds) | 15 | Maximum wait for each request, both to n8n and to InsightsHub (1 to 120). Without it, a slow InsightsHub keeps the workflow open until the gateway gives up, about 90 s. |
| Retries | 2 | Retries after a timeout, a network error or a 408, 425, 429, 500, 502, 503 or 504 response. Backoff is 1 s, then 3 s, then 9 s. In Error Workflow mode, a 404 while reading the failed execution is also retried, because the Error Trigger can fire before n8n has stored it. |
| Max Total Time (seconds) | 60 | Time budget for the whole node: the n8n read, the send and every retry. Each attempt is cut to what is left, and none starts once it is spent. |

- InsightsHub stores each execution once, keyed by project and execution id, and replaces its nodes, AI usage and errors on every send. A retry after a request that did reach the backend never duplicates data.
- Keep **Max Total Time** below the workflow's **Timeout Workflow** setting, minus what the rest of the workflow takes. Otherwise n8n can cancel the execution while it is being reported.

When every attempt fails and On Error is set to continue, the node outputs:

```json
{
  "success": false,
  "projectId": "6aZez6EeK5dW6GMR",
  "executionId": "1430643",
  "failedStep": "send the execution to InsightsHub",
  "attempts": 3,
  "error": "Failed to send the execution to InsightsHub: Gateway timed out - perhaps try again later?"
}
```

The InsightsHub backend also reconciles every hour: it compares the executions n8n still keeps with the ones it received, and re-collects the missing ones. A failed send is recovered as long as n8n has not pruned the execution yet.

## Output on success

```json
{ "success": true, "projectId": "6aZez6EeK5dW6GMR", "executionId": "1430643", "attempts": 1, "stored": true }
```

In native mode, the response from InsightsHub is merged in, and the execution itself is not echoed back.

## Development

```bash
npm ci
npm run lint
npm run build
npm run dev      # n8n with this node at http://localhost:5678
```

Releases are made with `npm run release` (lint, build, version bump, changelog, tag). The `*.*.*` tag publishes to npm from GitHub Actions.
