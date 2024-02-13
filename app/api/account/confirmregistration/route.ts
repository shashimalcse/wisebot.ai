import { redirect } from 'next/navigation';
import { NextResponse, NextRequest } from 'next/server'
import asgardeoClient from '../../../../lib/asgardeo_client';

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams
    const confirmation = searchParams.get('confirmation')
    if (confirmation) {
        const introspectResult = await asgardeoClient.intropectConfirmationCode(confirmation)
        if (introspectResult && !introspectResult.isExpired) {
            // const validateResult = await asgardeoClient.validateConfirmationCode(confirmation)    
            // if (validateResult) {
            //     redirect(`/workspace`)
            // }
            redirect(`/workspace?username=${introspectResult.user.username}&confirmation=${confirmation}`)
        } else {
            redirect('/signin')

        }
    } else {
        return new NextResponse(`Confirmation code is not valid`, {
            status: 400,
        })
    }
}
