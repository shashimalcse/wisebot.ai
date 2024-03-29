import { NextAuthOptions } from 'next-auth';
export const options: NextAuthOptions = {
    // Secret for Next-auth, without this JWT encryption/decryption won't work
    secret: process.env.NEXTAUTH_SECRET,

    // Configure one or more authentication providers
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
                token.org_id = account.org_id
            }
            return token;
        },
        async session({ session, token, user }: any) {
            session.user.id = token.id;
            session.idToken = token.id_token
            return session;
        },
    }
};
