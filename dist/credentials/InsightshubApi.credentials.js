"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightshubApi = void 0;
class InsightshubApi {
    constructor() {
        this.name = 'insightshubApi';
        this.displayName = 'Insightshub API';
        this.icon = { light: 'file:insightshub.svg', dark: 'file:insightshub.dark.svg' };
        this.documentationUrl = 'https://github.com/The-Codigo-Hub/n8n-nodes-insightshub#credentials';
        this.properties = [
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                required: true,
                default: '',
                placeholder: 'https://api.example.com',
                description: 'InsightHub API base URL. Set via the INSIGHTHUB_BASE_URL environment variable or enter it directly.',
            },
            {
                displayName: 'Collector API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                required: true,
                default: '',
                description: 'InsightHub collector token (INSIGHTHUB_COLLECTOR_TOKEN). Never share or log this value.',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'x-insighthub-token': '={{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/api/n8n/collector/check',
                method: 'GET',
            },
        };
    }
}
exports.InsightshubApi = InsightshubApi;
//# sourceMappingURL=InsightshubApi.credentials.js.map