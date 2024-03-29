class SuperbaseClient {

    constructor() {

    }

    async getOwnerOrg(owner_id: string) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPERBASE_URL}/rest/v1/rpc/get_org_id_by_owner_id?owner_id=${owner_id}`, {
                method: 'GET',
                headers: {
                    'apikey': process.env.SUPERBASE_API_KEY!,
                    'Authorization': `Bearer ${process.env.SUPERBASE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async createOwnerOrg(owner_id: string, org_id: string) {
        console.log(owner_id, org_id)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPERBASE_URL}/rest/v1/rpc/create_owner_workspace`, {
                method: 'POST',
                headers: {
                    'apikey': process.env.SUPERBASE_API_KEY!,
                    'Authorization': `Bearer ${process.env.SUPERBASE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    owner_id: owner_id,
                    org_id: org_id
                })
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

let superbaseClient: SuperbaseClient;

if (process.env.NODE_ENV === 'production') {
    superbaseClient = new SuperbaseClient();
} else {
    if (!globalThis.superbaseClient) {
        globalThis.superbaseClient = new SuperbaseClient();
    }
    superbaseClient = globalThis.superbaseClient;
}

export default superbaseClient;

