import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InsightshubApi implements ICredentialType {
	name = 'insightshubApi';
	displayName = 'Insightshub API';
	icon: ICredentialType['icon'] = { light: 'file:insightshub.svg', dark: 'file:insightshub.dark.svg' };

	documentationUrl = 'https://github.com/The-Codigo-Hub/n8n-nodes-insightshub#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'https://api.example.com',
			description:
				'InsightHub API base URL. Set via the INSIGHTHUB_BASE_URL environment variable or enter it directly.',
		},
		{
			displayName: 'Collector API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'InsightHub collector token (INSIGHTHUB_COLLECTOR_TOKEN). Never share or log this value.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-insighthub-token': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/n8n/collector/check',
			method: 'GET',
		},
	};
}
