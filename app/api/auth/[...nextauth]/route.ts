import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";


const handler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, {

    callbacks: {
        async jwt({ token, account, profile }: any) {
            if (profile) {
                token.id = profile.sub;
            }
            if (account) {
                token.id_token = account.id_token
                token.org_id = account.org_id
            }
            return token;
        },
        async session({ session, token, user }: any) {
            return session;
        },
    },
    debug: true,
    providers: [
        {
            authorization: {
                params: {
                    scope: "openid email profile"
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
            issuer: `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/token`
        }
    ],
    secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }
