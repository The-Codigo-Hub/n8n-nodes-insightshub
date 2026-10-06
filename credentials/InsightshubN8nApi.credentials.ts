import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InsightshubN8nApi implements ICredentialType {
	name = 'insightshubN8nApi';
	displayName = 'Insightshub N8n API';
	icon: ICredentialType['icon'] = {
		light: 'file:insightshub.svg',
		dark: 'file:insightshub.dark.svg',
	};

	documentationUrl = 'https://github.com/The-Codigo-Hub/n8n-nodes-insightshub#credentials';

	properties: INodeProperties[] = [
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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-N8N-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}/api/v1',
			url: '/executions',
			qs: { limit: 1 },
			method: 'GET',
		},
	};
}
