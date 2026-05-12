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
	

	// Link to your community node's README
	documentationUrl = 'https://github.com/The-Codigo-Hub/n8n-nodes-insightshub#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
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
			baseURL: 'https://insights-backend.wolfielab.xyz',
			url: '/api/n8n/collector/check',
		},
	};
}
