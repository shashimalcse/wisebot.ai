import { NextResponse, NextRequest } from 'next/server'
import asgardeoClient from '../../../../lib/asgardeo_client';

export async function POST(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams
    const workSpaceName = searchParams.get('workspace-name')
    console.log(workSpaceName)
    if (workSpaceName) {
        const isworkSpaceExists = await asgardeoClient.isOrgnizationAlreadyExists(workSpaceName)
        return isworkSpaceExists
    } else {
        return new NextResponse(`Workspace name is not found`, {
            status: 400,
        })
    }
}
