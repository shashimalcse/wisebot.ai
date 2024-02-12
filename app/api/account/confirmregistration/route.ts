import { redirect } from 'next/navigation';
import { NextResponse, NextRequest } from 'next/server'
import asgardeoClient from '../../../../lib/asgardeo_client';

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams
    const confirmation = searchParams.get('confirmation')
    if (confirmation) {
        const introspectResult = await asgardeoClient.intropectConfirmationCode(confirmation)
        if (introspectResult) {
            const validateResult = await asgardeoClient.validateConfirmationCode(confirmation)    
            if (validateResult) {
                redirect(`/workspace`)
            }
            
        } else {
            redirect('/signin')

        }
    } else {
        return new NextResponse(`Confirmation code is not valid`, {
            status: 400,
        })
    }
}
