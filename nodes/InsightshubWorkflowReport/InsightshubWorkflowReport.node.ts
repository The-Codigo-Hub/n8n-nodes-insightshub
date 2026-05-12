import {
	NodeConnectionTypes,
	NodeApiError,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';

// Programmatic style is required because:
// 1. We need execution-context APIs (getExecutionId, getWorkflow) unavailable in declarative style.
// 2. We send all items in one bulk POST rather than one request per item.


export class InsightshubWorkflowReport implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Insightshub: Report Execution',
		name: 'insightshubWorkflowReport',
        subtitle: '={{$parameter["workflowLabel"] || "No Label"}}',
		icon: { light: 'file:insightshub.svg', dark: 'file:insightshub.dark.svg' },
		group: ['output'],
		version: 1,
		description:
			'Collects all workflow execution data (items + metadata) and sends it to InsightsHub for analysis. Place this node at the end of your workflow.',
		defaults: {
			name: 'InsightsHub: Report Execution',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'insightshubApi', required: true }],
		properties: [
			{
				displayName: 'Workflow Label',
				name: 'workflowLabel',
				type: 'string',
				default: '',
				placeholder: 'e.g. lead-enrichment, daily-sync',
				description:
					'Optional label to categorize this workflow on the InsightsHub dashboard. Accepts fixed text or an expression.',
			},
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const workflowLabel = this.getNodeParameter('workflowLabel', 0, '') as string;

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
		} catch (error) {
			if (this.continueOnFail()) {
				return [
					items.map((item, index) => ({
						json: { ...item.json, _reportError: (error as Error).message },
						pairedItem: { item: index },
					})),
				];
			}

			throw new NodeApiError(this.getNode(), error as JsonObject);
		}

		// Pass all input items through unchanged so the workflow can continue
		return [items];
	}
}
