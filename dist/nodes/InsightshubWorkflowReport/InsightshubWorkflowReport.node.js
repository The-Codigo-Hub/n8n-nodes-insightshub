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
            credentials: [{ name: 'insightshubApi', required: true }],
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
                            description: 'Forward native n8n execution object(s) directly from input items',
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const items = this.getInputData();
        const payloadMode = this.getNodeParameter('payloadMode', 0, 'structured');
        const credentials = await this.getCredentials('insightshubApi');
        const baseUrl = credentials.baseUrl.replace(/\/+$/, '');
        let body;
        if (payloadMode === 'native') {
            const projectId = this.getNodeParameter('projectId', 0, '');
            if (!projectId) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Project ID is required');
            }
            const environment = this.getNodeParameter('environment', 0, 'prod');
            const projectName = this.getNodeParameter('projectName', 0, '');
            const n8nBaseUrl = this.getNodeParameter('n8nBaseUrl', 0, '').replace(/\/+$/, '');
            const n8nApiKey = this.getNodeParameter('n8nApiKey', 0, '');
            if (!n8nBaseUrl || !n8nApiKey) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'N8n Base URL and API Key are required for Native mode');
            }
            const executionId = this.getExecutionId();
            let executionData;
            try {
                executionData = await this.helpers.httpRequest({
                    method: 'GET',
                    url: `${n8nBaseUrl}/api/v1/executions/${executionId}?includeData=true`,
                    headers: { 'X-N8N-API-KEY': n8nApiKey },
                    json: true,
                });
            }
            catch (error) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error, {
                    message: `Failed to fetch execution ${executionId} from n8n API`,
                });
            }
            const wfStartedAt = executionData.startedAt;
            const wfStoppedAt = executionData.stoppedAt;
            const wfDurationMs = wfStartedAt && wfStoppedAt
                ? new Date(wfStoppedAt).getTime() - new Date(wfStartedAt).getTime()
                : 0;
            const wfData = executionData.workflowData;
            const runtimeData = (_a = executionData.data) === null || _a === void 0 ? void 0 : _a.runtimeData;
            const triggerNode = runtimeData === null || runtimeData === void 0 ? void 0 : runtimeData.triggerNode;
            const triggerType = (_b = executionData.mode) !== null && _b !== void 0 ? _b : runtimeData === null || runtimeData === void 0 ? void 0 : runtimeData.source;
            const triggerName = triggerNode === null || triggerNode === void 0 ? void 0 : triggerNode.name;
            const resultData = (_c = executionData.data) === null || _c === void 0 ? void 0 : _c.resultData;
            const runData = resultData === null || resultData === void 0 ? void 0 : resultData.runData;
            const wfNodes = wfData === null || wfData === void 0 ? void 0 : wfData.nodes;
            const nodeTypeMap = {};
            if (Array.isArray(wfNodes)) {
                for (const wfNode of wfNodes) {
                    if (wfNode.name && wfNode.type) {
                        nodeTypeMap[wfNode.name] = wfNode.type;
                    }
                }
            }
            const deriveProvider = (nodeType) => {
                const t = nodeType.toLowerCase();
                if (t.includes('openai'))
                    return 'openai';
                if (t.includes('anthropic'))
                    return 'anthropic';
                if (t.includes('gemini') || t.includes('googlevertex') || t.includes('googlepai'))
                    return 'google';
                if (t.includes('azure'))
                    return 'azure-openai';
                if (t.includes('mistral'))
                    return 'mistral';
                if (t.includes('ollama'))
                    return 'ollama';
                if (t.includes('cohere'))
                    return 'cohere';
                if (t.includes('huggingface') || t.includes('hugging'))
                    return 'huggingface';
                return nodeType || 'unknown';
            };
            const nativeNodes = [];
            const nativeAiUsage = [];
            if (runData) {
                for (const [nodeName, executions] of Object.entries(runData)) {
                    if (!Array.isArray(executions))
                        continue;
                    const nType = (_d = nodeTypeMap[nodeName]) !== null && _d !== void 0 ? _d : 'unknown';
                    for (const exec of executions) {
                        nativeNodes.push({
                            name: nodeName,
                            type: nType,
                            executionIndex: exec.executionIndex,
                            status: exec.executionStatus,
                            executionTime: exec.executionTime,
                            startTime: exec.startTime,
                        });
                        const nodeData = exec.data;
                        const aiLM = nodeData === null || nodeData === void 0 ? void 0 : nodeData.ai_languageModel;
                        const lmJson = ((_e = aiLM === null || aiLM === void 0 ? void 0 : aiLM[0]) === null || _e === void 0 ? void 0 : _e[0]) !== undefined
                            ? aiLM[0][0].json
                            : undefined;
                        const tokenUsage = lmJson === null || lmJson === void 0 ? void 0 : lmJson.tokenUsage;
                        if (tokenUsage) {
                            const response = lmJson === null || lmJson === void 0 ? void 0 : lmJson.response;
                            const generations = response === null || response === void 0 ? void 0 : response.generations;
                            const genInfo = (_g = (_f = generations === null || generations === void 0 ? void 0 : generations[0]) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.generationInfo;
                            nativeAiUsage.push({
                                node: nodeName,
                                provider: deriveProvider(nType),
                                model: (_h = genInfo === null || genInfo === void 0 ? void 0 : genInfo.model_name) !== null && _h !== void 0 ? _h : 'unknown',
                                promptTokens: tokenUsage.promptTokens,
                                completionTokens: tokenUsage.completionTokens,
                                totalTokens: tokenUsage.totalTokens,
                            });
                        }
                    }
                }
            }
            const nativeConv = this.getNodeParameter('nativeConversation', 0, {});
            const getNestedValue = (obj, path) => path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
            const getNodeJson = (rd, nodeName) => {
                var _a;
                if (!rd || !nodeName)
                    return undefined;
                const nodeExecs = rd[nodeName];
                if (!Array.isArray(nodeExecs) || !nodeExecs.length)
                    return undefined;
                const nodeData = nodeExecs[0].data;
                const main = nodeData === null || nodeData === void 0 ? void 0 : nodeData.main;
                const firstItem = (_a = main === null || main === void 0 ? void 0 : main[0]) === null || _a === void 0 ? void 0 : _a[0];
                return firstItem === null || firstItem === void 0 ? void 0 : firstItem.json;
            };
            const getFromRunDataNode = (rd, nodeName, dotPath) => {
                const json = getNodeJson(rd, nodeName);
                if (!json)
                    return undefined;
                const val = getNestedValue(json, dotPath);
                return val !== undefined && val !== null ? String(val) : undefined;
            };
            const pickFirstString = (json, candidates) => {
                for (const key of candidates) {
                    const val = getNestedValue(json, key);
                    if (val && typeof val === 'string')
                        return val;
                }
                return undefined;
            };
            let nativeConvPayload;
            if (nativeConv.inputNode || nativeConv.outputNode || nativeConv.channel) {
                const convInput = getFromRunDataNode(runData, nativeConv.inputNode, nativeConv.inputPath);
                const convOutput = getFromRunDataNode(runData, nativeConv.outputNode, nativeConv.outputPath);
                const convCustomerId = getFromRunDataNode(runData, nativeConv.inputNode, nativeConv.customerIdPath);
                const built = {
                    ...(nativeConv.channel ? { channel: nativeConv.channel } : {}),
                    ...(convCustomerId ? { customerId: convCustomerId } : {}),
                    ...(convInput ? { input: convInput } : {}),
                    ...(nativeConv.language ? { language: nativeConv.language } : {}),
                    ...(convOutput ? { output: convOutput } : {}),
                };
                if (Object.keys(built).length)
                    nativeConvPayload = built;
            }
            else if (runData) {
                const INPUT_CANDIDATES = ['body.message', 'body.Body', 'body.text', 'body.query', 'body.input', 'body.content', 'message', 'text', 'query', 'input', 'content'];
                const ID_CANDIDATES = ['body.userId', 'body.From', 'body.from', 'body.phone', 'body.sender', 'body.conversationId', 'body.chatId', 'body.sessionId', 'userId', 'From', 'from', 'phone', 'sender'];
                const OUTPUT_CANDIDATES = ['text', 'output', 'response', 'message', 'answer', 'content', 'result'];
                let autoInput;
                let autoCustomerId;
                if (triggerName) {
                    const triggerJson = getNodeJson(runData, triggerName);
                    if (triggerJson) {
                        autoInput = pickFirstString(triggerJson, INPUT_CANDIDATES);
                        autoCustomerId = pickFirstString(triggerJson, ID_CANDIDATES);
                    }
                }
                let maxExecIdx = -1;
                let autoOutput;
                for (const [, execs] of Object.entries(runData)) {
                    if (!Array.isArray(execs))
                        continue;
                    for (const exec of execs) {
                        const idx = (_j = exec.executionIndex) !== null && _j !== void 0 ? _j : -1;
                        if (idx <= maxExecIdx)
                            continue;
                        const nodeData = exec.data;
                        const main = nodeData === null || nodeData === void 0 ? void 0 : nodeData.main;
                        const firstItem = (_k = main === null || main === void 0 ? void 0 : main[0]) === null || _k === void 0 ? void 0 : _k[0];
                        const json = firstItem === null || firstItem === void 0 ? void 0 : firstItem.json;
                        if (!json)
                            continue;
                        const match = pickFirstString(json, OUTPUT_CANDIDATES);
                        if (match) {
                            maxExecIdx = idx;
                            autoOutput = match;
                        }
                    }
                }
                const built = {
                    ...(autoCustomerId ? { customerId: autoCustomerId } : {}),
                    ...(autoInput ? { input: autoInput } : {}),
                    ...(autoOutput ? { output: autoOutput } : {}),
                };
                if (Object.keys(built).length)
                    nativeConvPayload = built;
            }
            body = {
                projectId,
                ...(projectName ? { projectName } : {}),
                environment,
                workflow: {
                    id: executionData.workflowId,
                    name: (_l = wfData === null || wfData === void 0 ? void 0 : wfData.name) !== null && _l !== void 0 ? _l : '',
                    executionId: String(executionData.id),
                    status: (_m = executionData.status) !== null && _m !== void 0 ? _m : (executionData.finished ? 'success' : 'unknown'),
                    startedAt: wfStartedAt !== null && wfStartedAt !== void 0 ? wfStartedAt : new Date().toISOString(),
                    ...(wfStoppedAt ? { finishedAt: wfStoppedAt } : {}),
                    durationMs: wfDurationMs,
                    trigger: {
                        type: triggerType !== null && triggerType !== void 0 ? triggerType : 'unknown',
                        ...(triggerName ? { name: triggerName } : {}),
                    },
                },
                ...(nativeConvPayload ? { conversation: nativeConvPayload } : {}),
                ...(nativeAiUsage.length ? { aiUsage: nativeAiUsage } : {}),
                ...(nativeNodes.length ? { nodes: nativeNodes } : {}),
                metadata: { source: 'n8n-native' },
            };
        }
        else {
            const projectId = this.getNodeParameter('projectId', 0, '');
            if (!projectId) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Project ID is required');
            }
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
        let apiResponse;
        try {
            apiResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'insightshubApi', {
                method: 'POST',
                url: `${baseUrl}/api/n8n/executions/collect`,
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
                json: true,
            });
        }
        catch (error) {
            if (this.continueOnFail()) {
                return [
                    items.map((item, index) => ({
                        json: {
                            success: false,
                            error: error.message,
                            sentPayload: body,
                        },
                        pairedItem: { item: index },
                    })),
                ];
            }
            throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
        }
        const outputJson = {
            success: true,
            ...apiResponse,
            sentPayload: body,
        };
        return [[{ json: outputJson, pairedItem: { item: 0 } }]];
    }
}
exports.InsightshubWorkflowReport = InsightshubWorkflowReport;
//# sourceMappingURL=InsightshubWorkflowReport.node.js.map