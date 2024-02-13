import { NextResponse, NextRequest } from 'next/server'
import asgardeoClient from '../../../../lib/asgardeo_client';

export async function POST(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams
    const workSpaceName = searchParams.get('workspace-name')
    if (workSpaceName) {
        const isworkSpaceExists = await asgardeoClient.isOrgnizationAlreadyExists(workSpaceName)
        const responseBody = JSON.stringify({ available: isworkSpaceExists });
        return new NextResponse(responseBody, {
            status: 200,
        })
    } else {
        return new NextResponse(`Workspace name is not found`, {
            status: 400,
        })
    }
}
