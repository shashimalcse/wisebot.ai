import { NextRequest, NextResponse } from "next/server";

const getBasicAuth = (): string => Buffer
    .from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString("base64");


const getSwitchHeader = (): HeadersInit => {

    const headers = {
        "Access-Control-Allow-Credentials": true.toString(),
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_HOSTED_URL!,
        Authorization: `Basic ${getBasicAuth()}`,
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded"
    };

    return headers;
};

const getSwitchBody = (subOrgId: string, accessToken: string): Record<string, string> => {
    
    const body = {
        "grant_type": "organization_switch",
        "scope": "openid email profile internal_login internal_user_mgt_view internal_user_mgt_list " +
            "internal_user_mgt_update internal_user_mgt_delete internal_user_mgt_create internal_idp_view " +
            "internal_idp_create internal_idp_update internal_idp_delete internal_application_mgt_view " +
            "internal_application_mgt_update internal_application_mgt_create internal_application_mgt_delete " +
            "internal_organization_view internal_role_mgt_view internal_role_mgt_create internal_role_mgt_update " +
            "internal_role_mgt_delete internal_group_mgt_update internal_group_mgt_view internal_group_mgt_create " +
            "internal_group_mgt_delete internal_governance_view internal_governance_update",
        "switching_organization": subOrgId,
        "token": accessToken
    };

    return body;
};

const getSwitchRequest = (subOrgId: string, accessToken: string): RequestInit => {
    const request = {
        body: new URLSearchParams(getSwitchBody(subOrgId, accessToken)).toString(),
        headers: getSwitchHeader(),
        method: "POST"
    };

    return request;
};

const getSwitchEndpoint = (): string => `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/token`;


export async function POST(request: NextRequest) {

    
    const body = await request.json()
    const subOrgId = body.subOrgId;
    const accessToken = body.param;
    try {

        const fetchData = await fetch(
            getSwitchEndpoint(),
            getSwitchRequest(subOrgId, accessToken)
        );

        const data = await fetchData.json();  
        console.log(data)
        return new NextResponse(JSON.stringify(data), {
            status: 200,
        })
    } catch (err) {
        console.log(err)
    }
}
