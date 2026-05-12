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
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                required: true,
                default: '',
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
                baseURL: 'https://insights-backend.wolfielab.xyz/',
                url: '/v1/user',
            },
        };
    }
}
exports.InsightshubApi = InsightshubApi;
//# sourceMappingURL=InsightshubApi.credentials.js.map