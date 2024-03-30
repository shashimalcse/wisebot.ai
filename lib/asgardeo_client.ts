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

    public async getSwitchedAccessToken(subOrgId: string): Promise<string> {
        const body = {
            param: this.accessToken,
            subOrgId: subOrgId
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_URL!}/api/settings/switchorg`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        return await res.json();
    }

    public async retrieveAccessToken(): Promise<void> {

        const url = `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/token`;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
        };

        const body = new URLSearchParams({
            'grant_type': 'client_credentials',
            'scope': 'internal_identity_mgt_view internal_identity_mgt_update internal_identity_mgt_create internal_identity_mgt_delete internal_organization_view internal_organization_create internal_user_mgt_list internal_user_mgt_view',
            'client_id': process.env.MGT_CLIENT_ID!,
            'client_secret': process.env.MGT_CLIENT_SECRET!,
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/api/identity/user/v1.0/introspect-code`, {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/api/identity/user/v1.0/validate-code`, {
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

    public async createOrgnization(orgName: string, username: string): Promise<OrganizationCreateResult | undefined> {

        try {
            const userId = await this.getUserIdbyUsername(username)
            console.log("userid :" + userId)
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/server/v1/organizations`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAccessToken()}`,
                },
                body: JSON.stringify({
                    "name": orgName,
                    "parentId": process.env.ASGARDEO_ORG_ID,
                    "attributes": [
                        {
                            "key": "creator.id",
                            "value": userId
                        },
                        {
                            "key": "creator.username",
                            "value": username
                        }
                    ]
                })
            });
            if (response.status === 201) {
                const data: OrganizationCreateResult = await response.json();
                return data;
            } else if (response.status == 401) {
                await this.retrieveAccessToken();
                await this.createOrgnization(orgName, username);
            } else {
                throw new Error('Error while creating organization');
            }
        } catch (error) {
            throw new Error('Error while creating organization');
        }
    }

    public async getUserIdbyUsername(username: string): Promise<string | undefined> {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/scim2/Users?domain=DEFAULT&excludedAttributes=groups,roles&filter=emails+eq+${username}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAccessToken()}`,
                }
            });
            if (response.status === 200) {
                const data: UserListResponse = await response.json();
                return data.Resources[0].id;
            } else if (response.status == 401) {
                await this.retrieveAccessToken();
                await this.getUserIdbyUsername(username);
            } else {
                throw new Error('Error while getting user id of the use');
            }
        } catch (error) {
            throw new Error('Error while getting user id of the use');
        }
    }

    public async getAdministorRoleId(subOrgId: string): Promise<string | undefined> {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/server/v1/organizations/${subOrgId}/roles?filter=name%20eq%20Administrator}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getSwitchedAccessToken(subOrgId)}`,
                }
            });
            if (response.status === 200) {
                const data: UserListResponse = await response.json();
                return data.Resources[0].id;
            } else if (response.status == 401) {
                await this.retrieveAccessToken();
                await this.getAdministorRoleId(subOrgId);
            } else {
                throw new Error('Error while getting administrator role id of the suborg');
            }
        } catch (error) {
            throw new Error('Error while getting administrator role id of the suborg');
        }
    }

    public async assignAdministorRole(subOrgId: string, roleId: string, userId:string): Promise<string | undefined> {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/server/v1/organizations/${subOrgId}/roles/${roleId}`, {
                method: 'PATCH',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getSwitchedAccessToken(subOrgId)}`,
                },
                body: JSON.stringify({
                    operations: [
                        {
                            op: "ADD",
                            path: "users",
                            value: [
                                userId
                            ]
                        }
                    ]
                })
            });
            if (response.status === 200) {
                const data: UserListResponse = await response.json();
                return data.Resources[0].id;
            } else if (response.status == 401) {
                await this.retrieveAccessToken();
                await this.getAdministorRoleId(subOrgId);
            } else {
                throw new Error('Error while getting administrator role id of the suborg');
            }
        } catch (error) {
            throw new Error('Error while getting administrator role id of the suborg');
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

