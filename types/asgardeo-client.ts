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

interface CodeValidateData {
    username: string;
    tenantdomain: string;
    realm: string;
}
