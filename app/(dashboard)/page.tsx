'use client'

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter()
  const { data: session, status } = useSession()
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <Button variant="outline" type="button" onClick={() => 
                  signOut().then(() => {
                    const id_token_hint = session?.idToken ? session.idToken : ""
                    const logoutUrl = `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL!}/oidc/logout?id_token_hint=${id_token_hint}&post_logout_redirect_uri=${process.env.NEXT_PUBLIC_HOSTED_URL!}`
                    router.push(logoutUrl)
                  })}>
                  Sign out
                </Button>
    </main>
  );
}
