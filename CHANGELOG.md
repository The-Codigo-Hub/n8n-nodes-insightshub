## [Unreleased]

### Added
- **InsightsHub: Report Execution** node — a new programmatic node placed at the end of a workflow that collects all input items plus execution metadata (`executionId`, `workflowId`, `workflowName`, `collectedAt`, `itemCount`) and sends them as a single JSON payload to the InsightsHub backend (`POST /api/n8n/executions/collect`). Supports an optional `Workflow Label` parameter for categorization and passes all items through unchanged.
