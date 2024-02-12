'use client'

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignIn() {

    return (
        <div className="flex flex-row h-screen w-screen">
            <div className="flex items-center justify-center basis-1/2 bg-foreground">
                <div className="flex text-2xl font-medium text-cyan-50">
                    WiseBot
                </div>
            </div>
            <div className="flex items-center justify-center basis-1/2 bg-white">
                <Button variant="outline" type="button" onClick={() => signIn('Asgardeo')}>
                    Sign in with Asgardeo
                </Button>
            </div>
        </div>
    )
}
