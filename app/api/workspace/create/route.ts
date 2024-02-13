import { NextResponse, NextRequest } from 'next/server'
import asgardeoClient from '../../../../lib/asgardeo_client';
import { redirect } from 'next/navigation';

export async function POST(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams
    const workSpaceName = searchParams.get('workspace-name')
    const confirmation = searchParams.get('confirmation')
    const username = searchParams.get('username')
    if (confirmation) {
        const introspectResult = await asgardeoClient.intropectConfirmationCode(confirmation)
        if ((introspectResult && !introspectResult.isExpired)) {
            if (workSpaceName && username) {
                const isOrgnizationAvailable = await asgardeoClient.isOrgnizationAvailable(workSpaceName)
                if (isOrgnizationAvailable) {
                    const OrganizationCreateResult = await asgardeoClient.createOrgnization(workSpaceName, username)
                    const responseBody = JSON.stringify(OrganizationCreateResult);
                    return new NextResponse(responseBody, {
                        status: 200,
                    })
                } else {
                    return new NextResponse(`Workspace name is not avialable`, {
                        status: 400,
                    })
                }
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
