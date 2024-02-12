import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";


const handler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, {

    callbacks: {
        async jwt({ token, account, profile }) {

            if (account) {
                token.accessToken = account.access_token;
                token.idToken = account.id_token;
                token.scope = account.scope;
                token.user = profile;
            }
            return token;
        }
    },
    debug: true,
    providers: [
        {
            authorization: {
                params: {
                    scope:  "openid email profile"
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
            userinfo: `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/oauth2/userinfo`,
            wellKnown: `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/oauth2/token/.well-known/openid-configuration`,
            issuer: `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/oauth2/token`
        } 
    ],
    secret: process.env.SECRET
})

export { handler as GET, handler as POST }
