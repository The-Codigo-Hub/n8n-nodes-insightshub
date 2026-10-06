"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightshubWorkflowReport = void 0;
const n8n_workflow_1 = require("n8n-workflow");
function safeParseJson(value, fallback) {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch {
            return fallback;
        }
    }
    if (value !== null && value !== undefined)
        return value;
    return fallback;
}
class InsightshubWorkflowReport {
    constructor() {
        this.description = {
            displayName: 'Insightshub: Report Execution',
            name: 'insightshubWorkflowReport',
            subtitle: '={{$parameter["projectId"] || "No Project"}}',
            icon: { light: 'file:insightshub.svg', dark: 'file:insightshub.dark.svg' },
            group: ['output'],
            version: 1,
            description: 'Collects workflow execution telemetry and sends it to InsightHub for analysis. Place this node at the end of your workflow.',
            defaults: {
                name: 'InsightsHub: Report Execution',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [
                { name: 'insightshubApi', required: true },
                {
                    name: 'insightshubN8nApi',
                    required: true,
                    displayOptions: { show: { payloadMode: ['native'] } },
                },
            ],
            usableAsTool: true,
            properties: [
                {
                    displayName: 'Payload Mode',
                    name: 'payloadMode',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Native N8n Execution',
                            value: 'native',
                            description: 'Fetch the current execution from the n8n API and send it as-is (recommended)',
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
                {
                    displayName: 'In Native mode the full execution is sent to InsightsHub, which detects the conversation automatically. The workflow must have "Save execution progress" enabled in its settings.',
                    name: 'nativeNotice',
                    type: 'notice',
                    displayOptions: { show: { payloadMode: ['native'] } },
                    default: '',
                },
                {
                    displayName: 'Conversation Overrides',
                    name: 'conversationOverrides',
                    type: 'collection',
                    displayOptions: { show: { payloadMode: ['native'] } },
                    placeholder: 'Add Override',
                    default: {},
                    description: "Optional values that take precedence over the automatic conversation detection. Use expressions, e.g. {{ $('Webhook').first().JSON.body.userId }}.",
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
                            displayName: 'Conversation ID',
                            name: 'conversationId',
                            type: 'string',
                            default: '',
                            description: 'Identifier of the conversation or session',
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
                        {
                            displayName: 'User ID',
                            name: 'userId',
                            type: 'string',
                            default: '',
                            placeholder: '5491100000000',
                            description: 'Identifier of the end user (phone, WhatsApp ID, email, etc.)',
                        },
                    ],
                },
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
                    displayOptions: { show: { payloadMode: ['structured', 'native'] } },
                    default: 0,
                    description: 'Numeric client identifier (optional). Leave as 0 to omit from the payload.',
                },
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
                    description: 'ISO 8601 datetime when the workflow execution started. Defaults to the current time if left empty.',
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
                {
                    displayName: 'AI Usage',
                    name: 'aiUsage',
                    type: 'json',
                    displayOptions: { show: { payloadMode: ['structured'] } },
                    default: '[]',
                    description: 'JSON array of AI model usage objects. Use apiKeyRef for a safe label only — never include real API keys or tokens.',
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
                    description: 'Additional metadata object. Do not include secrets, API keys, passwords, or tokens.',
                },
            ],
        };
    }
    async execute() {
        var _a;
        const items = this.getInputData();
        const payloadMode = this.getNodeParameter('payloadMode', 0, 'structured');
        const credentials = await this.getCredentials('insightshubApi');
        const baseUrl = credentials.baseUrl.replace(/\/+$/, '');
        const projectId = this.getNodeParameter('projectId', 0, '');
        if (!projectId) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Project ID is required');
        }
        let body = {};
        let apiResponse;
        let failedStep = payloadMode === 'native'
            ? 'fetch the execution from the n8n API'
            : 'build the InsightsHub payload';
        try {
            body =
                payloadMode === 'native'
                    ? await buildNativePayload.call(this, projectId)
                    : buildStructuredPayload.call(this, projectId);
            failedStep = 'send the execution to InsightsHub';
            apiResponse = (await this.helpers.httpRequestWithAuthentication.call(this, 'insightshubApi', {
                method: 'POST',
                url: `${baseUrl}/api/n8n/executions/collect`,
                headers: { 'Content-Type': 'application/json' },
                body,
                json: true,
            }));
        }
        catch (error) {
            if (this.continueOnFail()) {
                return [
                    items.map((_item, index) => ({
                        json: {
                            success: false,
                            projectId,
                            executionId: this.getExecutionId(),
                            error: error.message,
                        },
                        pairedItem: { item: index },
                    })),
                ];
            }
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                    description: (_a = error.description) !== null && _a !== void 0 ? _a : undefined,
                });
            }
            throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
                message: `Failed to ${failedStep}`,
            });
        }
        const outputJson = {
            success: true,
            projectId,
            ...apiResponse,
            ...(payloadMode === 'native' ? {} : { sentPayload: body }),
        };
        return [items.map((_item, index) => ({ json: outputJson, pairedItem: { item: index } }))];
    }
}
exports.InsightshubWorkflowReport = InsightshubWorkflowReport;
const ACTIVE_STATUSES = new Set(['new', 'running', 'waiting', 'unknown']);
function cleanString(value) {
    if (value === undefined || value === null)
        return undefined;
    const text = String(value).trim();
    return text ? text : undefined;
}
async function buildNativePayload(projectId) {
    const n8nCredentials = await this.getCredentials('insightshubN8nApi');
    const n8nBaseUrl = n8nCredentials.baseUrl
        .replace(/\/+$/, '')
        .replace(/\/api\/v1$/, '');
    const executionId = this.getExecutionId();
    const execution = (await this.helpers.httpRequestWithAuthentication.call(this, 'insightshubN8nApi', {
        method: 'GET',
        url: `${n8nBaseUrl}/api/v1/executions/${executionId}`,
        qs: { includeData: true },
        json: true,
    }));
    const data = execution.data;
    const resultData = data === null || data === void 0 ? void 0 : data.resultData;
    const runData = resultData === null || resultData === void 0 ? void 0 : resultData.runData;
    if (!runData || Object.keys(runData).length === 0) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Execution ${executionId} has no node data yet`, {
            description: 'Enable "Save execution progress" in the workflow settings so the n8n API returns the data of nodes that already ran.',
        });
    }
    const status = cleanString(execution.status);
    const finalised = {};
    if (!status || ACTIVE_STATUSES.has(status)) {
        finalised.status = (resultData === null || resultData === void 0 ? void 0 : resultData.error) ? 'error' : 'success';
        finalised.finished = !(resultData === null || resultData === void 0 ? void 0 : resultData.error);
        finalised.stoppedAt = new Date().toISOString();
    }
    const environment = this.getNodeParameter('environment', 0, 'prod');
    const projectName = cleanString(this.getNodeParameter('projectName', 0, ''));
    const clientId = this.getNodeParameter('clientId', 0, 0);
    const overrides = this.getNodeParameter('conversationOverrides', 0, {});
    const conversation = {};
    for (const key of ['channel', 'userId', 'conversationId', 'input', 'output', 'language']) {
        const value = cleanString(overrides[key]);
        if (value)
            conversation[key] = value;
    }
    return {
        ...execution,
        ...finalised,
        projectId,
        ...(projectName ? { projectName } : {}),
        ...(clientId > 0 ? { clientId } : {}),
        environment,
        ...(Object.keys(conversation).length ? { conversation } : {}),
        collector: {
            source: 'n8n-nodes-insightshub',
            node: this.getNode().name,
            snapshotStatus: status !== null && status !== void 0 ? status : 'unknown',
        },
    };
}
function buildStructuredPayload(projectId) {
    const environment = this.getNodeParameter('environment', 0, 'prod');
    const projectName = this.getNodeParameter('projectName', 0, '');
    const clientId = this.getNodeParameter('clientId', 0, 0);
    const workflowStatus = this.getNodeParameter('workflowStatus', 0, 'success');
    const startedAtParam = this.getNodeParameter('startedAt', 0, '');
    const startedAt = startedAtParam || new Date().toISOString();
    const durationMs = this.getNodeParameter('durationMs', 0, 0);
    const triggerType = this.getNodeParameter('triggerType', 0, '');
    const triggerPath = this.getNodeParameter('triggerPath', 0, '');
    const conversation = this.getNodeParameter('conversation', 0, {});
    const aiUsage = safeParseJson(this.getNodeParameter('aiUsage', 0, '[]'), []);
    const nodes = safeParseJson(this.getNodeParameter('nodes', 0, '[]'), []);
    const errors = safeParseJson(this.getNodeParameter('errors', 0, '[]'), []);
    const metadata = safeParseJson(this.getNodeParameter('metadata', 0, '{}'), {});
    const workflow = this.getWorkflow();
    const executionId = this.getExecutionId();
    const trigger = {};
    if (triggerType)
        trigger.type = triggerType;
    if (triggerPath)
        trigger.path = triggerPath;
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
    return {
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
//# sourceMappingURL=InsightshubWorkflowReport.node.js.map