# API documentation

Discover `JetBrains` IDE configurations and projects, read deployments and mappings, and inspect saved authentication. Add the optional Portline bridge for normalized profiles and guarded writing.

## Start here

1. [Choose the package](/guide/installation) needed by the code.
2. [Run the API quick start](/api/quick-start) with complete code and verified output.
3. Continue with [settings and deployments](/guide/deployments), [discovery](/guide/discovery) or [the optional bridge](/guide/portline).

The quick start uses `@jalsoedesign/jsbrains`, the original read-only SDK. The normalized bridge is an optional package, `@jalsoedesign/jsbrains-portline`.

## Reference and advanced usage

Use [method contracts](/reference/api) or [exact TypeScript signatures](/reference/types) for lookup. [Execution boundaries](/api/integration) explain how metadata relates to separate transport/database operations. Review [writing safeguards](/guide/writing) before applying changes.

For terminal use, switch to [CLI documentation](/cli/).

## Connect through the shared integration

Use [shared FTP/SFTP and SSH execution](/api/integration) to reuse a selected normalized profile with `@jalsoedesign/portline-dockline`. The guide includes reader-specific source creation, optional client installation, scoped cleanup and trust/authentication requirements. Native readers do not open connections while listing profiles.
