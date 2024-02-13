import { NextResponse, NextRequest } from 'next/server'
import asgardeoClient from '../../../../lib/asgardeo_client';
import { redirect } from 'next/navigation';

export async function POST(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams
    const workSpaceName = searchParams.get('workspace-name')
    const confirmation = searchParams.get('confirmation')
    if (confirmation) {
        const introspectResult = await asgardeoClient.intropectConfirmationCode(confirmation)
        if ((introspectResult && !introspectResult.isExpired)) {
            if (workSpaceName) {
                const isOrgnizationAvailable = await asgardeoClient.isOrgnizationAvailable(workSpaceName)
                const responseBody = JSON.stringify({ available: isOrgnizationAvailable });
                return new NextResponse(responseBody, {
                    status: 200,
                })
            } else {
                return new NextResponse(`Workspace name is not found`, {
                    status: 400,
                })
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
