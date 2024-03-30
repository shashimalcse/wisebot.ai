import { NextAuthOptions } from 'next-auth';
import superbaseClient from '../../../../lib/superbase_client';
import { JWT } from 'next-auth/jwt';
export const options: NextAuthOptions = {
    // Secret for Next-auth, without this JWT encryption/decryption won't work
    secret: process.env.NEXTAUTH_SECRET,

    // Configure one or more authentication providers
    providers: [
        {
            authorization: {
                params: {
                    scope: "openid email profile internal_login internal_user_mgt_view internal_user_mgt_list internal_user_mgt_update internal_user_mgt_delete internal_user_mgt_create internal_idp_view internal_idp_create internal_idp_update internal_idp_delete internal_application_mgt_view internal_application_mgt_update internal_application_mgt_create internal_application_mgt_delete internal_organization_view internal_role_mgt_view internal_role_mgt_create internal_role_mgt_update internal_role_mgt_delete internal_group_mgt_update internal_group_mgt_view internal_group_mgt_create internal_group_mgt_delete internal_governance_view internal_governance_update"
                }
            },
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            id: "Asgardeo",
            name: "Asgardeo",
            profile(profile) {

                return {
                    id: profile.sub
                };
            },
            type: "oauth",
            userinfo: `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/userinfo`,
            wellKnown: `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/token/.well-known/openid-configuration`,
            issuer: `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/token`,


        }
    ],
    callbacks: {
        async jwt({ token, account, profile }: any) {
            if (profile) {
                token.id = profile.sub;
            }
            if (account) {
                token.id_token = account.id_token
                token.accessToken = account.access_token
                token.org_id = profile.org_id
            }
            return token;
        },
        async session({ session, token, user }: any) {
            const orgSession = await switchOrg(token);
            if (!orgSession) {
                session.error = true;
            } else if (orgSession.expires_in <= 0) {
                session.expires = true;
            }
            else {
                session.accessToken = orgSession.access_token;
                session.idToken = orgSession.id_token;
                session.scope = orgSession.scope;
                session.refreshToken = orgSession.refresh_token;
                session.expires = false;
                session.userId = token.id;
                session.user = user;
                session.orgId = getOrgId(session.idToken!);
                session.orgName = getOrgName(session.idToken!);
                session.orginalIdToken = token.id_token;
            }
            return session;
        },
        async signIn({ user, account, profile, email, credentials }: any) {
            
            if (profile.org_id !== process.env.ASGARDEO_ORG_ID) {
                return false
            }
            superbaseClient.getOwnerOrg(profile.sub).then((data:any) => {
                if (data) {

                } else {
                    return false
                }
            })
            return true
        }
    },
};


async function switchOrg(token: JWT): Promise<OrgSession | null> {

    try {

    const subOrgId: string = await getOrganizationId(token);
    const accessToken: string = (token.accessToken as string);
    const body = {
                param: accessToken,
                subOrgId: subOrgId
            };
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_URL!}/api/settings/switchorg`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    return data;
    } catch (err) {
        return null;
    }

}

async function getOrganizationId(token: JWT): Promise<string> {

    const data = await superbaseClient.getOwnerOrg(token.sub!);
    if (data) {
        return data;
    } else {
        return "";
    }
}

export function parseJwt(token: JWT) {

    const buffestString: Buffer = Buffer.from(token.toString().split(".")[1], "base64");

    return JSON.parse(buffestString.toString());
}

export function getOrgId(token: JWT): string {

    if (parseJwt(token)["org_id"]) {

        return parseJwt(token)["org_id"];
    }

    return process.env.SUB_ORGANIZATION_ID!;
}

export function getOrgName(token: JWT): string {

    if (parseJwt(token)["org_name"]) {

        return parseJwt(token)["org_name"];
    }

    return process.env.SUB_ORGANIZATION_NAME!;
}
