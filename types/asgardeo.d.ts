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
