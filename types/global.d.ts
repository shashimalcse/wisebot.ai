import type { AsgardeoClient } from '../lib/asgardeo_client'

declare global {
  namespace globalThis {
    var asgardeoClient: AsgardeoClient
  }
}
