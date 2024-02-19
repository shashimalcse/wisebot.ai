const { CredentialsMethod, OpenFgaClient } = require('@openfga/sdk');

class AuthzClient {

    private openFga = new OpenFgaClient({
        apiScheme: 'https',
        apiHost: process.env.FGA_API_HOST,
        storeId: process.env.FGA_STORE_ID,
        authorizationModelId: process.env.FGA_MODEL_ID,
        credentials: {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER,
            apiAudience: process.env.FGA_API_AUDIENCE,
            clientId: process.env.FGA_CLIENT_ID,
            clientSecret: process.env.FGA_STORFGA_CLIENT_SECRETE_ID, // Secret you got from this page
          },
        }
    })

    constructor() {

    }
}

let authzClient: AuthzClient;

if (process.env.NODE_ENV === 'production') {
    authzClient = new AuthzClient();
} else {
    if (!globalThis.authzClient) {
        globalThis.authzClient = new AuthzClient();
    }
    authzClient = globalThis.authzClient;
}

export default authzClient;

