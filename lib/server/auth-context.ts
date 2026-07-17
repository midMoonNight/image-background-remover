import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AuthEnvironment } from "@/lib/server/auth";

export function getAuthEnvironment(): AuthEnvironment {
  try {
    return getCloudflareContext().env as AuthEnvironment;
  } catch {
    return process.env as AuthEnvironment;
  }
}
