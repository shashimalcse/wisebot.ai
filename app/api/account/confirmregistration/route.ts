import { redirect } from 'next/navigation';
import { NextResponse, NextRequest } from 'next/server'


const fetchAccessToken = async (): Promise<string> => {
    const url = `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/oauth2/token`;
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
    };

    const body = new URLSearchParams({
        'grant_type': 'client_credentials',
        'scope': 'internal_identity_mgt_view internal_identity_mgt_update internal_identity_mgt_create internal_identity_mgt_delete',
        'client_id': process.env.CLIENT_ID!,
        'client_secret': process.env.CLIENT_SECRET!,
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body.toString(),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Access Token:', data.access_token);
        return data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        return '';
    }
};

interface IntrospectData {
    user: {
        username: string;
        tenantdomain: string;
        realm: string;
    };
    recoveryScenario: string;
    recoveryStep: string;
    isExpired: boolean;
}


const introspectCode = async (token: string, code: string): Promise<IntrospectData | null> => {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/identity/user/v1.0/introspect-code`, {
            method: 'POST', // Changed to POST assuming you're sending data in the body
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                "code": code,
                "verifiedChannel": {
                    "type": "EMAIL",
                    "claim": "http://wso2.org/claims/emailaddress"
                },
                "properties": []
            })
        });

        if (response.status === 202) {
            const data: IntrospectData = await response.json();
            return data;
        } else {
            console.log(response.status)
            throw new Error('Fetch did not return the expected status code of 202');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

interface ValidateData {
    username: string;
    tenantdomain: string;
    realm: string;
}

const validateCode = async (token: string, code: string): Promise<ValidateData | null> => {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/api/identity/user/v1.0/validate-code`, {
            method: 'POST', // Changed to POST assuming you're sending data in the body
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                "code": code,
                "verifiedChannel": {
                    "type": "EMAIL",
                    "claim": "http://wso2.org/claims/emailaddress"
                },
                "properties": []
            })
        });

        if (response.status === 202) {
            const data: ValidateData = await response.json();
            return data;
        } else {
            console.log(response.status)
            throw new Error('Fetch did not return the expected status code of 202');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams
    const confirmation = searchParams.get('confirmation')
    var err: string = "";
    if (confirmation) {
        const token = await fetchAccessToken();
        const introspectResult = await introspectCode(token, confirmation)
        if (introspectResult) {
            const validateResult = await validateCode(token, confirmation)    
            if (validateResult) {
                redirect(`/workspace?username=${validateResult.username}&tenantDomain=`)
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
