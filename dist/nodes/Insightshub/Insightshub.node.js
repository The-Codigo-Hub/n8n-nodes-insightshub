"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insightshub = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const user_1 = require("./resources/user");
const company_1 = require("./resources/company");
class Insightshub {
    constructor() {
        this.description = {
            displayName: 'Insightshub',
            name: 'insightshub',
            icon: { light: 'file:insightshub.svg', dark: 'file:insightshub.dark.svg' },
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Interact with the Insightshub API',
            defaults: {
                name: 'Insightshub',
            },
            usableAsTool: true,
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [{ name: 'insightshubApi', required: true }],
            requestDefaults: {
                baseURL: 'https://insights-backend.wolfielab.xyz/',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Company',
                            value: 'company',
                        },
                        {
                            name: 'User',
                            value: 'user',
                        },
                    ],
                    default: 'user',
                },
                ...user_1.userDescription,
                ...company_1.companyDescription,
            ],
        };
    }
}
exports.Insightshub = Insightshub;
//# sourceMappingURL=Insightshub.node.js.map