import type { AsgardeoClient } from '../lib/asgardeo_client'
import type { AuthzClient } from '../lib/authz_client'

declare global {
  namespace globalThis {
    var asgardeoClient: AsgardeoClient
    var authzClient: AuthzClient
  }
}
