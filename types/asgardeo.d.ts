interface CodeIntrospectResult {
    user: {
        username: string;
        tenantdomain: string;
        realm: string;
    };
    recoveryScenario: string;
    recoveryStep: string;
    isExpired: boolean;
}

interface CodeValidateResult {
    username: string;
    tenantdomain: string;
    realm: string;
}

interface OrganizationExistsResult {
    available: boolean;
}

interface OrganizationCreateResult {
    id: string;
    name: string;
    status: string;
    created: string;
    lastModified: string;
    type: string;
    parent: {
        id: string;
        ref: string;
    };
};

interface UserListResponse {
    totalResults: number;
    startIndex: number;
    itemsPerPage: number;
    schemas: string[];
    Resources: UserResource[];
}

interface UserResource {
    emails: string[];
    meta: Meta;
    id: string;
    userName: string;
    "urn:scim:wso2:schema": UserScimWso2Schema;
}

interface Meta {
    created: string;
    location: string;
    lastModified: string;
    resourceType: string;
}

interface UserScimWso2Schema {
    accountLocked: string;
    accountState: string;
    lockedReason: string;
    preferredChannel: string;
    userSource: string;
    idpType: string;
    userAccountType: string;
}

interface OrgSession {
    access_token?: string
    scope?: string,
    id_token?: JWT,
    refresh_token?: string,
    token_type?: string,
    expires_in: number
}
