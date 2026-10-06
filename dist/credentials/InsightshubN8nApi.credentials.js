"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightshubN8nApi = void 0;
class InsightshubN8nApi {
    constructor() {
        this.name = 'insightshubN8nApi';
        this.displayName = 'Insightshub N8n API';
        this.icon = {
            light: 'file:insightshub.svg',
            dark: 'file:insightshub.dark.svg',
        };
        this.documentationUrl = 'https://github.com/The-Codigo-Hub/n8n-nodes-insightshub#credentials';
        this.properties = [
            {
                displayName: 'N8n Base URL',
                name: 'baseUrl',
                type: 'string',
                required: true,
                default: '',
                placeholder: 'https://n8n.example.com',
                description: 'Public base URL of this n8n instance, without /api/v1',
            },
            {
                displayName: 'N8n API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                required: true,
                default: '',
                description: 'N8n API key with permission to read executions (Settings → n8n API)',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'X-N8N-API-KEY': '={{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}/api/v1',
                url: '/executions',
                qs: { limit: 1 },
                method: 'GET',
            },
        };
    }
}
exports.InsightshubN8nApi = InsightshubN8nApi;
//# sourceMappingURL=InsightshubN8nApi.credentials.js.map