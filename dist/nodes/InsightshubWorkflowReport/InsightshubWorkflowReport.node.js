"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightshubWorkflowReport = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class InsightshubWorkflowReport {
    constructor() {
        this.description = {
            displayName: 'Insightshub: Report Execution',
            name: 'insightshubWorkflowReport',
            subtitle: '={{$parameter["workflowLabel"] || "No Label"}}',
            icon: { light: 'file:insightshub.svg', dark: 'file:insightshub.dark.svg' },
            group: ['output'],
            version: 1,
            description: 'Collects all workflow execution data (items + metadata) and sends it to InsightsHub for analysis. Place this node at the end of your workflow.',
            defaults: {
                name: 'InsightsHub: Report Execution',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [{ name: 'insightshubApi', required: true }],
            properties: [
                {
                    displayName: 'Workflow Label',
                    name: 'workflowLabel',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. lead-enrichment, daily-sync',
                    description: 'Optional label to categorize this workflow on the InsightsHub dashboard. Accepts fixed text or an expression.',
                },
            ],
            usableAsTool: true,
        };
    }
    async execute() {
        const items = this.getInputData();
        const workflowLabel = this.getNodeParameter('workflowLabel', 0, '');
        const workflow = this.getWorkflow();
        const executionId = this.getExecutionId();
        const payload = {
            executionId,
            workflowId: workflow.id,
            workflowName: workflow.name,
            ...(workflowLabel ? { workflowLabel } : {}),
            collectedAt: new Date().toISOString(),
            itemCount: items.length,
            items: items.map((item) => item.json),
        };
        try {
            await this.helpers.httpRequestWithAuthentication.call(this, 'insightshubApi', {
                method: 'POST',
                url: 'https://insights-backend.wolfielab.xyz/api/n8n/executions/collect',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: payload,
                json: true,
            });
        }
        catch (error) {
            if (this.continueOnFail()) {
                return [
                    items.map((item, index) => ({
                        json: { ...item.json, _reportError: error.message },
                        pairedItem: { item: index },
                    })),
                ];
            }
            throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
        }
        return [items];
    }
}
exports.InsightshubWorkflowReport = InsightshubWorkflowReport;
//# sourceMappingURL=InsightshubWorkflowReport.node.js.map