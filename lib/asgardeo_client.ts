class AsgardeoClient {
    private accessToken: string | null;

    constructor(accessToken: string | null = null) {
        this.accessToken = accessToken;
    }

    public setAccessToken(accessToken: string): void {
        this.accessToken = accessToken;
    }

    public async getAccessToken(): Promise<string> {
        if (this.accessToken === null) {
            await this.retrieveAccessToken();
        }
        return this.accessToken!;
    }

    public async retrieveAccessToken(): Promise<void> {

        const url = `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/oauth2/token`;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
        };

        const body = new URLSearchParams({
            'grant_type': 'client_credentials',
            'scope': 'internal_identity_mgt_view internal_identity_mgt_update internal_identity_mgt_create internal_identity_mgt_delete internal_organization_view',
            'client_id': process.env.CLIENT_ID!,
            'client_secret': process.env.CLIENT_SECRET!,
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body.toString(),
            });

            if (response.status === 200) {
                const data = await response.json();
                this.accessToken = data.access_token;
            } else {
                throw new Error('Error while introspecting confirmation code');
            }
        } catch (error) {
            throw new Error('Error fetching access token');
        }
    }

    public async intropectConfirmationCode(code: string): Promise<CodeIntrospectResult | undefined> {


        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/identity/user/v1.0/introspect-code`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAccessToken()}`,
                },
                body: JSON.stringify({
                    "code": code,
                    "verifiedChannel": {
                        "type": "EMAIL",
                        "claim": "http://wso2.org/claims/emailaddress"
                    },
                    "properties": []
                })
            });
            if (response.status === 202) {
                const data: CodeIntrospectResult = await response.json();
                return data;
            } else if (response.status == 401) {
                await this.retrieveAccessToken();
                await this.intropectConfirmationCode(code);
            } else {
                throw new Error('Error while introspecting confirmation code');
            }
        } catch (error) {
            throw new Error('Error while introspecting confirmation code');
        }
    }

    public async validateConfirmationCode(code: string): Promise<CodeValidateResult | undefined> {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/identity/user/v1.0/validate-code`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAccessToken()}`,
                },
                body: JSON.stringify({
                    "code": code,
                    "verifiedChannel": {
                        "type": "EMAIL",
                        "claim": "http://wso2.org/claims/emailaddress"
                    },
                    "properties": []
                })
            });

            if (response.status === 202) {
                const data: CodeValidateResult = await response.json();
                return data;
            } else if (response.status == 401) {
                await this.retrieveAccessToken();
                await this.validateConfirmationCode(code);
            } else {
                throw new Error('Error while validating confirmation code');
            }
        } catch (error) {
            throw new Error('Error while validating confirmation code');
        }
    }

    public async isOrgnizationAlreadyExists(orgName: string): Promise<boolean | undefined> {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/api/server/v1/organizations/check-name`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAccessToken()}`,
                },
                body: JSON.stringify({
                    "name": orgName,
                })
            });

            if (response.status === 200) {
                const data: OrganizationExistsResult = await response.json();
                return data.available;
            } else if (response.status == 401) {
                await this.retrieveAccessToken();
                await this.isOrgnizationAlreadyExists(orgName);
            } else {
                throw new Error('Error while checking organization name exists');
            }
        } catch (error) {
            throw new Error('Error while checking organization name exists');
        }
    }
}

let asgardeoClient: AsgardeoClient;

if (process.env.NODE_ENV === 'production') {
    asgardeoClient = new AsgardeoClient();
} else {
    if (!globalThis.asgardeoClient) {
        globalThis.asgardeoClient = new AsgardeoClient();
    }
    asgardeoClient = globalThis.asgardeoClient;
}

export default asgardeoClient;

