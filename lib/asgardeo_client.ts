class Client {
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
            'scope': 'internal_identity_mgt_view internal_identity_mgt_update internal_identity_mgt_create internal_identity_mgt_delete',
            'client_id': process.env.CLIENT_ID!,
            'client_secret': process.env.CLIENT_SECRET!,
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body.toString(),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
        } catch (error) {
            console.error('Error fetching access token:', error);
        }
    }

    public async intropectConfirmationCode(code: string): Promise<CodeIntrospectResult | undefined> {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/identity/user/v1.0/introspect-code`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAccessToken()}`,
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
                console.log(response.status)
                throw new Error('Fetch did not return the expected status code of 202');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    public async validateConfirmationCode(code: string): Promise<CodeValidateData | undefined> {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/identity/user/v1.0/validate-code`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAccessToken()}`,
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
                const data: CodeValidateData = await response.json();
                return data;
            } else if (response.status == 401) {
                await this.retrieveAccessToken();
                await this.validateConfirmationCode(code);
            } else {
                console.log(response.status)
                throw new Error('Fetch did not return the expected status code of 202');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
}

