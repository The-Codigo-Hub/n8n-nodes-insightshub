import {
	NodeConnectionTypes,
	NodeApiError,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';

// Programmatic style is required because:
// 1. We need execution-context APIs (getExecutionId, getWorkflow, getCredentials).
// 2. We build a single bulk POST rather than per-item requests.

function safeParseJson(value: unknown, fallback: unknown): unknown {
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch {
			return fallback;
		}
	}
	if (value !== null && value !== undefined) return value;
	return fallback;
}

export class InsightshubWorkflowReport implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Insightshub: Report Execution',
		name: 'insightshubWorkflowReport',
		subtitle: '={{$parameter["projectId"] || "No Project"}}',
		icon: { light: 'file:insightshub.svg', dark: 'file:insightshub.dark.svg' },
		group: ['output'],
		version: 1,
		description:
			'Collects workflow execution telemetry and sends it to InsightHub for analysis. Place this node at the end of your workflow.',
		defaults: {
			name: 'InsightsHub: Report Execution',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'insightshubApi', required: true }],
		usableAsTool: true,
		properties: [
			// ── Payload mode ────────────────────────────────────────────────────────
			{
				displayName: 'Payload Mode',
				name: 'payloadMode',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Native N8n Execution',
						value: 'native',
						description:
							'Forward native n8n execution object(s) directly from input items',
					},
					{
						name: 'Structured',
						value: 'structured',
						description: 'Build a structured InsightHub payload from parameters',
					},
				],
				default: 'structured',
				description: 'How to build the payload sent to InsightHub',
			},

			// ── Shared required fields (both modes) ─────────────────────────────────
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'my-n8n-project',
				description: 'Unique identifier for this project in InsightHub',
			},
			{
				displayName: 'Environment',
				name: 'environment',
				type: 'options',
				options: [
					{ name: 'Development', value: 'dev' },
					{ name: 'Production', value: 'prod' },
					{ name: 'Staging', value: 'staging' },
					{ name: 'Test', value: 'test' },
				],
				default: 'prod',
				description: 'Deployment environment for this workflow execution',
			},

			// ── Native mode: n8n API connection ─────────────────────────────────────
			{
				displayName: 'N8n Base URL',
				name: 'n8nBaseUrl',
				type: 'string',
				displayOptions: { show: { payloadMode: ['native'] } },
				required: true,
				default: 'http://localhost:5678',
				placeholder: 'http://localhost:5678',
				description: 'Base URL of your n8n instance (used to call /api/v1/executions)',
			},
			{
				displayName: 'N8n API Key',
				name: 'n8nApiKey',
				type: 'string',
				typeOptions: { password: true },
				displayOptions: { show: { payloadMode: ['native'] } },
				required: true,
				default: '',
				description: 'N8n API key with permission to read executions (Settings → API)',
			},

			// ── Native mode: conversation extraction ────────────────────────────────
			{
				displayName: 'Conversation',
				name: 'nativeConversation',
				type: 'collection',
				displayOptions: { show: { payloadMode: ['native'] } },
				placeholder: 'Add Conversation Data',
				default: {},
				description: 'Optional: extract conversation input/output from execution run data',
				options: [
					{
						displayName: 'Channel',
						name: 'channel',
						type: 'string',
						default: '',
						placeholder: 'whatsapp',
						description: 'Communication channel (e.g. whatsapp, telegram, web)',
					},
					{
						displayName: 'Customer ID Path',
						name: 'customerIdPath',
						type: 'string',
						default: '',
						placeholder: 'body.userId',
						description: 'Dot-path to the customer/user ID in the input node\'s first output JSON (e.g. body.userId)',
					},
					{
						displayName: 'Input Node',
						name: 'inputNode',
						type: 'string',
						default: '',
						placeholder: 'Webhook',
						description: 'Name of the node whose first output contains the user input (as it appears in runData)',
					},
					{
						displayName: 'Input Path',
						name: 'inputPath',
						type: 'string',
						default: '',
						placeholder: 'body.message',
						description: 'Dot-path to the input text within that node\'s JSON output (e.g. body.message)',
					},
					{
						displayName: 'Language',
						name: 'language',
						type: 'string',
						default: '',
						placeholder: 'es',
						description: 'BCP-47 language code (e.g. en, es, pt)',
					},
					{
						displayName: 'Output Node',
						name: 'outputNode',
						type: 'string',
						default: '',
						placeholder: 'Code',
						description: 'Name of the node whose first output contains the assistant response',
					},
					{
						displayName: 'Output Path',
						name: 'outputPath',
						type: 'string',
						default: '',
						placeholder: 'text',
						description: 'Dot-path to the output text within that node\'s JSON output (e.g. text)',
					},
				],
			},

			// ── Structured mode: additional required fields ──────────────────────────

			// ── Structured mode: optional project fields ─────────────────────────────
			{
				displayName: 'Project Name',
				name: 'projectName',
				type: 'string',
				displayOptions: { show: { payloadMode: ['structured', 'native'] } },
				default: '',
				placeholder: 'My n8n Project',
				description: 'Human-readable project name (optional)',
			},
			{
				displayName: 'Client ID',
				name: 'clientId',
				type: 'number',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: 0,
				description:
					'Numeric client identifier (optional). Leave as 0 to omit from the payload.',
			},

			// ── Structured mode: workflow details ────────────────────────────────────
			{
				displayName: 'Workflow Status',
				name: 'workflowStatus',
				type: 'options',
				displayOptions: { show: { payloadMode: ['structured'] } },
				options: [
					{ name: 'Canceled', value: 'canceled' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Error', value: 'error' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Running', value: 'running' },
					{ name: 'Success', value: 'success' },
					{ name: 'Unknown', value: 'unknown' },
					{ name: 'Waiting', value: 'waiting' },
				],
				default: 'success',
				description: 'Final status of the workflow execution',
			},
			{
				displayName: 'Started At',
				name: 'startedAt',
				type: 'string',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: '',
				placeholder: '2026-05-12T12:00:00.000Z',
				description:
					'ISO 8601 datetime when the workflow execution started. Defaults to the current time if left empty.',
			},
			{
				displayName: 'Duration (Ms)',
				name: 'durationMs',
				type: 'number',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: 0,
				description: 'Workflow execution duration in milliseconds',
			},
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'string',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: '',
				placeholder: 'webhook',
				description: 'Type of trigger that started the workflow (e.g. webhook, schedule, manual)',
			},
			{
				displayName: 'Trigger Path',
				name: 'triggerPath',
				type: 'string',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: '',
				placeholder: '/webhook/example',
				description: 'URL path or identifier of the trigger',
			},

			// ── Structured mode: conversation ────────────────────────────────────────
			{
				displayName: 'Conversation',
				name: 'conversation',
				type: 'collection',
				displayOptions: { show: { payloadMode: ['structured'] } },
				placeholder: 'Add Conversation Data',
				default: {},
				description: 'Optional conversation data to associate with this execution',
				options: [
					{
						displayName: 'Channel',
						name: 'channel',
						type: 'string',
						default: '',
						placeholder: 'whatsapp',
						description: 'Communication channel (e.g. whatsapp, telegram, web)',
					},
					{
						displayName: 'Customer ID',
						name: 'customerId',
						type: 'string',
						default: '',
						description: 'Customer or user identifier for this conversation',
					},
					{
						displayName: 'Input',
						name: 'input',
						type: 'string',
						typeOptions: { rows: 3 },
						default: '',
						description: 'User message or input text',
					},
					{
						displayName: 'Language',
						name: 'language',
						type: 'string',
						default: '',
						placeholder: 'es',
						description: 'BCP-47 language code (e.g. en, es, pt)',
					},
					{
						displayName: 'Output',
						name: 'output',
						type: 'string',
						typeOptions: { rows: 3 },
						default: '',
						description: 'Assistant response or output text',
					},
				],
			},

			// ── Structured mode: advanced JSON fields ────────────────────────────────
			{
				displayName: 'AI Usage',
				name: 'aiUsage',
				type: 'json',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: '[]',
				description:
					'JSON array of AI model usage objects. Use apiKeyRef for a safe label only — never include real API keys or tokens.',
			},
			{
				displayName: 'Nodes',
				name: 'nodes',
				type: 'json',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: '[]',
				description: 'JSON array of individual node execution telemetry objects',
			},
			{
				displayName: 'Errors',
				name: 'errors',
				type: 'json',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: '[]',
				description: 'JSON array of error objects encountered during execution',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				displayOptions: { show: { payloadMode: ['structured'] } },
				default: '{}',
				description:
					'Additional metadata object. Do not include secrets, API keys, passwords, or tokens.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const payloadMode = this.getNodeParameter('payloadMode', 0, 'structured') as string;

		const credentials = await this.getCredentials('insightshubApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

		let body: IDataObject | IDataObject[];

		if (payloadMode === 'native') {
			const projectId = this.getNodeParameter('projectId', 0, '') as string;
			if (!projectId) {
				throw new NodeOperationError(this.getNode(), 'Project ID is required');
			}
			const environment = this.getNodeParameter('environment', 0, 'prod') as string;
			const projectName = this.getNodeParameter('projectName', 0, '') as string;
			const n8nBaseUrl = (this.getNodeParameter('n8nBaseUrl', 0, '') as string).replace(/\/+$/, '');
			const n8nApiKey = this.getNodeParameter('n8nApiKey', 0, '') as string;

			if (!n8nBaseUrl || !n8nApiKey) {
				throw new NodeOperationError(this.getNode(), 'N8n Base URL and API Key are required for Native mode');
			}

			const executionId = this.getExecutionId();

			let executionData: IDataObject;
			try {
				// Reason: the n8n API key is a user-supplied node parameter, not a managed credential.
				// eslint-disable-next-line @n8n/community-nodes/no-http-request-with-manual-auth
				executionData = await this.helpers.httpRequest({
					method: 'GET',
					url: `${n8nBaseUrl}/api/v1/executions/${executionId}?includeData=true`,
					headers: { 'X-N8N-API-KEY': n8nApiKey },
					json: true,
				}) as IDataObject;
			} catch (error) {
				throw new NodeApiError(this.getNode(), error as JsonObject, {
					message: `Failed to fetch execution ${executionId} from n8n API`,
				});
			}

			// Map n8n API response fields to InsightHub workflow schema
			// Response shape: { id, workflowId, workflowData, status, startedAt, stoppedAt, mode,
			//                   data: { resultData: { runData }, runtimeData } }
			const wfStartedAt = executionData.startedAt as string | undefined;
			const wfStoppedAt = executionData.stoppedAt as string | undefined;
			const wfDurationMs =
				wfStartedAt && wfStoppedAt
					? new Date(wfStoppedAt).getTime() - new Date(wfStartedAt).getTime()
					: 0;
			const wfData = executionData.workflowData as IDataObject | undefined;

			// ── Trigger info ────────────────────────────────────────────────────────
			const runtimeData = (executionData.data as IDataObject)?.runtimeData as IDataObject | undefined;
			const triggerNode = runtimeData?.triggerNode as IDataObject | undefined;
			const triggerType = (executionData.mode as string | undefined) ?? (runtimeData?.source as string | undefined);
			const triggerName = triggerNode?.name as string | undefined;

			// ── Node telemetry & AI usage from runData ────────────────────────────
			const resultData = (executionData.data as IDataObject)?.resultData as IDataObject | undefined;
			const runData = resultData?.runData as Record<string, IDataObject[]> | undefined;

			// Build name → n8n type lookup from workflowData.nodes
			const wfNodes = wfData?.nodes as IDataObject[] | undefined;
			const nodeTypeMap: Record<string, string> = {};
			if (Array.isArray(wfNodes)) {
				for (const wfNode of wfNodes) {
					if (wfNode.name && wfNode.type) {
						nodeTypeMap[wfNode.name as string] = wfNode.type as string;
					}
				}
			}

			// Derive a human-readable provider from the n8n node type string
			const deriveProvider = (nodeType: string): string => {
				const t = nodeType.toLowerCase();
				if (t.includes('openai')) return 'openai';
				if (t.includes('anthropic')) return 'anthropic';
				if (t.includes('gemini') || t.includes('googlevertex') || t.includes('googlepai')) return 'google';
				if (t.includes('azure')) return 'azure-openai';
				if (t.includes('mistral')) return 'mistral';
				if (t.includes('ollama')) return 'ollama';
				if (t.includes('cohere')) return 'cohere';
				if (t.includes('huggingface') || t.includes('hugging')) return 'huggingface';
				return nodeType || 'unknown';
			};

			const nativeNodes: IDataObject[] = [];
			const nativeAiUsage: IDataObject[] = [];

			if (runData) {
				for (const [nodeName, executions] of Object.entries(runData)) {
					if (!Array.isArray(executions)) continue;
					const nType = nodeTypeMap[nodeName] ?? 'unknown';
					for (const exec of executions) {
						nativeNodes.push({
							name: nodeName,
							type: nType,
							executionIndex: exec.executionIndex,
							status: exec.executionStatus,
							executionTime: exec.executionTime,
							startTime: exec.startTime,
						});

						// Extract token usage from ai_languageModel outputs
						const nodeData = exec.data as IDataObject | undefined;
						const aiLM = nodeData?.ai_languageModel as unknown[][] | undefined;
						const lmJson = aiLM?.[0]?.[0] !== undefined
							? ((aiLM[0][0] as IDataObject).json as IDataObject | undefined)
							: undefined;
						const tokenUsage = lmJson?.tokenUsage as IDataObject | undefined;
						if (tokenUsage) {
							const response = lmJson?.response as IDataObject | undefined;
							const generations = response?.generations as unknown[][] | undefined;
							const genInfo = (generations?.[0]?.[0] as IDataObject | undefined)
								?.generationInfo as IDataObject | undefined;
							nativeAiUsage.push({
								node: nodeName,
								provider: deriveProvider(nType),
								model: genInfo?.model_name ?? 'unknown',
								promptTokens: tokenUsage.promptTokens,
								completionTokens: tokenUsage.completionTokens,
								totalTokens: tokenUsage.totalTokens,
							});
						}
					}
				}
			}

			// ── Conversation extraction ───────────────────────────────────────────────
			const nativeConv = this.getNodeParameter('nativeConversation', 0, {}) as IDataObject;

			const getNestedValue = (obj: IDataObject, path: string): unknown =>
				path.split('.').reduce((acc: unknown, key: string) =>
					(acc && typeof acc === 'object' ? (acc as IDataObject)[key] : undefined), obj as unknown);

			const getFromRunDataNode = (
				rd: Record<string, IDataObject[]> | undefined,
				nodeName: string,
				dotPath: string,
			): string | undefined => {
				if (!rd || !nodeName || !dotPath) return undefined;
				const nodeExecs = rd[nodeName];
				if (!Array.isArray(nodeExecs) || !nodeExecs.length) return undefined;
				const nodeData = nodeExecs[0].data as IDataObject | undefined;
				const main = nodeData?.main as unknown[][] | undefined;
				const firstItem = main?.[0]?.[0] as IDataObject | undefined;
				const json = firstItem?.json as IDataObject | undefined;
				if (!json) return undefined;
				const val = getNestedValue(json, dotPath);
				return val !== undefined ? String(val) : undefined;
			};

			let nativeConvPayload: IDataObject | undefined;
			if (nativeConv.inputNode || nativeConv.outputNode || nativeConv.channel) {
				const convInput = getFromRunDataNode(runData, nativeConv.inputNode as string, nativeConv.inputPath as string);
				const convOutput = getFromRunDataNode(runData, nativeConv.outputNode as string, nativeConv.outputPath as string);
				const convCustomerId = getFromRunDataNode(runData, nativeConv.inputNode as string, nativeConv.customerIdPath as string);
				const built: IDataObject = {
					...(nativeConv.channel ? { channel: nativeConv.channel } : {}),
					...(convCustomerId ? { customerId: convCustomerId } : {}),
					...(convInput ? { input: convInput } : {}),
					...(nativeConv.language ? { language: nativeConv.language } : {}),
					...(convOutput ? { output: convOutput } : {}),
				};
				if (Object.keys(built).length) nativeConvPayload = built;
			}

			body = {
				projectId,
				...(projectName ? { projectName } : {}),
				environment,
				workflow: {
					id: executionData.workflowId,
					name: wfData?.name ?? '',
					executionId: String(executionData.id),
					status: executionData.status ?? (executionData.finished ? 'success' : 'unknown'),
					startedAt: wfStartedAt ?? new Date().toISOString(),
					...(wfStoppedAt ? { finishedAt: wfStoppedAt } : {}),
					durationMs: wfDurationMs,
					trigger: {
						type: triggerType ?? 'unknown',
						...(triggerName ? { name: triggerName } : {}),
					},
				},
				...(nativeConvPayload ? { conversation: nativeConvPayload } : {}),
				...(nativeAiUsage.length ? { aiUsage: nativeAiUsage } : {}),
				...(nativeNodes.length ? { nodes: nativeNodes } : {}),
				metadata: { source: 'n8n-native' },
			};
		} else {
			// Build structured InsightHub payload
			const projectId = this.getNodeParameter('projectId', 0, '') as string;
			if (!projectId) {
				throw new NodeOperationError(this.getNode(), 'Project ID is required');
			}

			const environment = this.getNodeParameter('environment', 0, 'prod') as string;
			const projectName = this.getNodeParameter('projectName', 0, '') as string;
			const clientId = this.getNodeParameter('clientId', 0, 0) as number;
			const workflowStatus = this.getNodeParameter('workflowStatus', 0, 'success') as string;
			const startedAtParam = this.getNodeParameter('startedAt', 0, '') as string;
			const startedAt = startedAtParam || new Date().toISOString();
			const durationMs = this.getNodeParameter('durationMs', 0, 0) as number;
			const triggerType = this.getNodeParameter('triggerType', 0, '') as string;
			const triggerPath = this.getNodeParameter('triggerPath', 0, '') as string;
			const conversation = this.getNodeParameter('conversation', 0, {}) as Record<
				string,
				unknown
			>;
			const aiUsage = safeParseJson(this.getNodeParameter('aiUsage', 0, '[]'), []) as unknown[];
			const nodes = safeParseJson(this.getNodeParameter('nodes', 0, '[]'), []) as unknown[];
			const errors = safeParseJson(this.getNodeParameter('errors', 0, '[]'), []) as unknown[];
			const metadata = safeParseJson(this.getNodeParameter('metadata', 0, '{}'), {}) as object;

			const workflow = this.getWorkflow();
			const executionId = this.getExecutionId();

			const trigger: Record<string, string> = {};
			if (triggerType) trigger.type = triggerType;
			if (triggerPath) trigger.path = triggerPath;

			const finishedAt = durationMs
				? new Date(new Date(startedAt).getTime() + durationMs).toISOString()
				: undefined;

			const hasConversation = Object.keys(conversation).length > 0;
			const conversationPayload = hasConversation
				? {
						...(conversation.customerId ? { customerId: conversation.customerId } : {}),
						...(conversation.channel ? { channel: conversation.channel } : {}),
						...(conversation.input ? { input: conversation.input } : {}),
						...(conversation.output ? { output: conversation.output } : {}),
						...(conversation.language ? { language: conversation.language } : {}),
						metadata: {},
					}
				: undefined;

			body = {
				projectId,
				...(projectName ? { projectName } : {}),
				...(clientId > 0 ? { clientId } : {}),
				environment,
				workflow: {
					id: workflow.id,
					name: workflow.name,
					executionId,
					status: workflowStatus,
					startedAt,
					...(finishedAt ? { finishedAt } : {}),
					...(durationMs > 0 ? { durationMs } : {}),
					...(Object.keys(trigger).length ? { trigger } : {}),
				},
				...(conversationPayload ? { conversation: conversationPayload } : {}),
				...(aiUsage.length ? { aiUsage } : {}),
				...(nodes.length ? { nodes } : {}),
				...(errors.length ? { errors } : {}),
				metadata: { source: 'n8n', ...metadata },
			};
		}

		let apiResponse: IDataObject;
		try {
			apiResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'insightshubApi', {
				method: 'POST',
				url: `${baseUrl}/api/n8n/executions/collect`,
				headers: {
					'Content-Type': 'application/json',
				},
				body,
				json: true,
			}) as IDataObject;
		} catch (error) {
			if (this.continueOnFail()) {
				return [
					items.map((item, index) => ({
						json: {
							success: false,
							error: (error as Error).message,
							sentPayload: body,
						},
						pairedItem: { item: index },
					})),
				];
			}

			throw new NodeApiError(this.getNode(), error as JsonObject);
		}

		const outputJson: IDataObject = {
			success: true,
			...apiResponse,
			sentPayload: body,
		};

		return [[{ json: outputJson, pairedItem: { item: 0 } }]];
	}
}

