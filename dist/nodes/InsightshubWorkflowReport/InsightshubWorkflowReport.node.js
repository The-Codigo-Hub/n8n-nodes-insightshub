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
            description: 'Collects workflow execution telemetry and sends it to InsightHub for analysis. Place this node at the end of your workflow, or after an Error Trigger to report failed executions.',
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
                    displayName: 'Execution to Report',
                    name: 'executionSource',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { payloadMode: ['native'] } },
                    options: [
                        {
                            name: 'Failed Execution (Error Workflow)',
                            value: 'errorTrigger',
                            description: 'Report the execution that failed. Place the node after an Error Trigger, so executions that never reached the end of the workflow are reported too.',
                        },
                        {
                            name: 'This Execution',
                            value: 'current',
                            description: 'Report the execution this node runs in. Place the node at the end of the workflow.',
                        },
                    ],
                    default: 'current',
                },
                {
                    displayName: 'In an Error Workflow, set Project ID and Project Name with expressions that read the workflow in the Error Trigger output (see the README), so the failed execution is stored under the same project as its workflow. InsightsHub ignores failed executions of workflows it does not know.',
                    name: 'errorTriggerNotice',
                    type: 'notice',
                    displayOptions: { show: { payloadMode: ['native'], executionSource: ['errorTrigger'] } },
                    default: '',
                },
                {
                    displayName: 'Execution ID',
                    name: 'executionId',
                    type: 'string',
                    displayOptions: { show: { payloadMode: ['native'], executionSource: ['errorTrigger'] } },
                    default: '={{ $json.execution.id }}',
                    required: true,
                    description: 'ID of the failed execution. The default expression reads it from the Error Trigger output.',
                },
                {
                    displayName: 'Conversation Overrides',
                    name: 'conversationOverrides',
                    type: 'collection',
                    displayOptions: { show: { payloadMode: ['native'] } },
                    placeholder: 'Add Override',
                    default: {},
                    description: 'Optional values that take precedence over the automatic conversation detection. Usually set with expressions that read the trigger node (see each field placeholder).',
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
                            placeholder: "={{ $('Webhook').first().json.body.conversationId }}",
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
                            placeholder: "={{ $('Webhook').first().json.body.userId }}",
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
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    description: 'How the node talks to InsightsHub and n8n. InsightsHub stores each execution once, so a retried send never duplicates data.',
                    options: [
                        {
                            displayName: 'Timeout (Seconds)',
                            name: 'timeout',
                            type: 'number',
                            typeOptions: { minValue: 1, maxValue: 120 },
                            default: DEFAULT_TIMEOUT_SECONDS,
                            description: 'Maximum time to wait for each request (reading the execution from n8n and sending it to InsightsHub). Max Total Time caps the whole node, retries included.',
                        },
                        {
                            displayName: 'Max Total Time (Seconds)',
                            name: 'maxTotalSeconds',
                            type: 'number',
                            typeOptions: { minValue: 10, maxValue: 600 },
                            default: DEFAULT_MAX_TOTAL_SECONDS,
                            description: 'Time budget for the whole node, retries included. No new attempt starts once it is spent. Keep it below the workflow timeout.',
                        },
                        {
                            displayName: 'Retries',
                            name: 'retries',
                            type: 'number',
                            typeOptions: { minValue: 0, maxValue: 5 },
                            default: DEFAULT_RETRIES,
                            description: 'How many times to retry a request that fails with a timeout, a network error or a 408, 429 or 5xx response',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        var _a, _b;
        const items = this.getInputData();
        const payloadMode = this.getNodeParameter('payloadMode', 0, 'structured');
        const credentials = await this.getCredentials('insightshubApi');
        const baseUrl = credentials.baseUrl.replace(/\/+$/, '');
        const projectId = this.getNodeParameter('projectId', 0, '');
        if (!projectId) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Project ID is required');
        }
        const delivery = getDeliveryOptions.call(this);
        const executionSource = payloadMode === 'native'
            ? this.getNodeParameter('executionSource', 0, 'current')
            : 'current';
        let body = {};
        let apiResponse;
        let reportedExecutionId = this.getExecutionId();
        let failedStep = payloadMode === 'native'
            ? 'fetch the execution from the n8n API'
            : 'build the InsightsHub payload';
        let attempts = 0;
        try {
            if (payloadMode === 'native') {
                reportedExecutionId = resolveExecutionId.call(this, executionSource);
                body = await buildNativePayload.call(this, projectId, {
                    executionId: reportedExecutionId,
                    executionSource,
                    delivery,
                });
            }
            else {
                body = buildStructuredPayload.call(this, projectId);
            }
            failedStep = 'send the execution to InsightsHub';
            const sent = await requestWithRetry.call(this, 'insightshubApi', {
                method: 'POST',
                url: `${baseUrl}/api/n8n/executions/collect`,
                headers: { 'Content-Type': 'application/json' },
                body,
                json: true,
            }, delivery);
            apiResponse = sent.response;
            attempts = sent.attempts;
        }
        catch (error) {
            if (this.continueOnFail()) {
                const failedAttempts = (_a = error.attempts) !== null && _a !== void 0 ? _a : attempts;
                return [
                    items.map((_item, index) => ({
                        json: {
                            success: false,
                            projectId,
                            executionId: reportedExecutionId,
                            failedStep,
                            attempts: failedAttempts,
                            error: `Failed to ${failedStep}: ${error.message}`,
                        },
                        pairedItem: { item: index },
                    })),
                ];
            }
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                    description: (_b = error.description) !== null && _b !== void 0 ? _b : undefined,
                });
            }
            throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
                message: `Failed to ${failedStep}`,
            });
        }
        const outputJson = {
            success: true,
            projectId,
            executionId: reportedExecutionId,
            attempts,
            ...apiResponse,
            ...(payloadMode === 'native' ? {} : { sentPayload: body }),
        };
        return [items.map((_item, index) => ({ json: outputJson, pairedItem: { item: index } }))];
    }
}
exports.InsightshubWorkflowReport = InsightshubWorkflowReport;
const ACTIVE_STATUSES = new Set(['new', 'running', 'waiting', 'unknown']);
const DEFAULT_TIMEOUT_SECONDS = 15;
const DEFAULT_RETRIES = 2;
const DEFAULT_MAX_TOTAL_SECONDS = 60;
const MIN_ATTEMPT_MS = 1000;
const RETRY_BASE_DELAY_MS = 1000;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = new Set([
    'ECONNABORTED',
    'ECONNREFUSED',
    'ECONNRESET',
    'EAI_AGAIN',
    'ENOTFOUND',
    'EPIPE',
    'ETIMEDOUT',
]);
function cleanString(value) {
    if (value === undefined || value === null)
        return undefined;
    const text = String(value).trim();
    return text ? text : undefined;
}
function getDeliveryOptions() {
    var _a, _b, _c;
    const options = this.getNodeParameter('options', 0, {});
    const timeoutSeconds = Number((_a = options.timeout) !== null && _a !== void 0 ? _a : DEFAULT_TIMEOUT_SECONDS);
    const retries = Number((_b = options.retries) !== null && _b !== void 0 ? _b : DEFAULT_RETRIES);
    const maxTotalSeconds = Number((_c = options.maxTotalSeconds) !== null && _c !== void 0 ? _c : DEFAULT_MAX_TOTAL_SECONDS);
    const totalSeconds = Math.min(Math.max(Number.isFinite(maxTotalSeconds) ? maxTotalSeconds : DEFAULT_MAX_TOTAL_SECONDS, 10), 600);
    return {
        deadline: Date.now() + totalSeconds * 1000,
        timeoutMs: Math.round(Math.min(Math.max(Number.isFinite(timeoutSeconds) && timeoutSeconds > 0 ? timeoutSeconds : DEFAULT_TIMEOUT_SECONDS, 1), 120) * 1000),
        retries: Math.min(Math.max(Number.isFinite(retries) ? Math.floor(retries) : DEFAULT_RETRIES, 0), 5),
    };
}
function statusCodeOf(error) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const candidate = error;
    const raw = (_g = (_f = (_e = (_d = (_b = (_a = candidate.response) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : (_c = candidate.response) === null || _c === void 0 ? void 0 : _c.statusCode) !== null && _d !== void 0 ? _d : candidate.statusCode) !== null && _e !== void 0 ? _e : candidate.status) !== null && _f !== void 0 ? _f : candidate.httpCode) !== null && _g !== void 0 ? _g : (_j = (_h = candidate.cause) === null || _h === void 0 ? void 0 : _h.response) === null || _j === void 0 ? void 0 : _j.status;
    const code = Number(raw);
    return Number.isFinite(code) && code > 0 ? code : undefined;
}
function isRetryable(error, extraStatusCodes = []) {
    var _a, _b, _c;
    const statusCode = statusCodeOf(error);
    if (statusCode !== undefined) {
        return RETRYABLE_STATUS_CODES.has(statusCode) || extraStatusCodes.includes(statusCode);
    }
    const code = (_a = error.code) !== null && _a !== void 0 ? _a : (_b = error.cause) === null || _b === void 0 ? void 0 : _b.code;
    if (code && RETRYABLE_ERROR_CODES.has(code))
        return true;
    return /timeout|timed out|socket hang up|network/i.test((_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : '');
}
async function requestWithRetry(credentialType, request, delivery, { extraRetryStatusCodes = [] } = {}) {
    let lastError;
    let attempts = 0;
    for (let attempt = 0; attempt <= delivery.retries; attempt++) {
        if (attempt > 0) {
            const backoff = RETRY_BASE_DELAY_MS * 3 ** (attempt - 1);
            if (delivery.deadline - Date.now() - backoff < MIN_ATTEMPT_MS)
                break;
            await (0, n8n_workflow_1.sleep)(backoff);
        }
        const remaining = delivery.deadline - Date.now();
        if (remaining < MIN_ATTEMPT_MS) {
            lastError !== null && lastError !== void 0 ? lastError : (lastError = new Error('The node ran out of time (Max Total Time) before sending'));
            break;
        }
        attempts = attempt + 1;
        try {
            const response = (await this.helpers.httpRequestWithAuthentication.call(this, credentialType, {
                ...request,
                timeout: Math.min(delivery.timeoutMs, remaining),
            }));
            return { response, attempts };
        }
        catch (error) {
            lastError = error;
            if (!isRetryable(error, extraRetryStatusCodes))
                break;
        }
    }
    if (lastError && typeof lastError === 'object') {
        lastError.attempts = attempts;
    }
    throw lastError;
}
function resolveExecutionId(executionSource) {
    if (executionSource !== 'errorTrigger')
        return this.getExecutionId();
    const executionId = cleanString(this.getNodeParameter('executionId', 0, ''));
    if (!executionId) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No execution ID to report', {
            description: 'In "Failed Execution (Error Workflow)" mode the node must run after an Error Trigger, which provides execution.id.',
        });
    }
    if (executionId === this.getExecutionId()) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'The Execution ID points to this same execution', {
            description: 'Use "This Execution" to report the current execution, or set Execution ID to {{ $json.execution.id }} after an Error Trigger.',
        });
    }
    return executionId;
}
async function buildNativePayload(projectId, { executionId, executionSource, delivery, }) {
    const n8nCredentials = await this.getCredentials('insightshubN8nApi');
    const n8nBaseUrl = n8nCredentials.baseUrl
        .replace(/\/+$/, '')
        .replace(/\/api\/v1$/, '');
    const { response: execution } = await requestWithRetry.call(this, 'insightshubN8nApi', {
        method: 'GET',
        url: `${n8nBaseUrl}/api/v1/executions/${encodeURIComponent(executionId)}`,
        qs: { includeData: true },
        json: true,
    }, delivery, { extraRetryStatusCodes: executionSource === 'errorTrigger' ? [404] : [] });
    const data = execution.data;
    const resultData = data === null || data === void 0 ? void 0 : data.resultData;
    const runData = resultData === null || resultData === void 0 ? void 0 : resultData.runData;
    if (!runData || Object.keys(runData).length === 0) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Execution ${executionId} has no node data yet`, {
            description: executionSource === 'errorTrigger'
                ? 'n8n did not keep the data of the failed execution. Check "Save failed production executions" in the workflow settings.'
                : 'Enable "Save execution progress" in the workflow settings so the n8n API returns the data of nodes that already ran.',
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
            executionSource,
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