# API guide

Use [TypeScript signatures](/reference/types) for exact parameters, return types and all public exports.

## Original read-only SDK

| API | Purpose |
| --- | --- |
| `JetBrains.detect(options?)` | Discover IDE configuration installations |
| `JetBrains.fromConfigPath(path, options?)` | Open an explicit IDE configuration |
| `JetBrains.findProject(options?)` | Find a project by walking upward |
| `getInstallations` / `getInstallation` | Enumerate or select a product/version |
| `installation.getProject` / `getRecentProjects` | Bind projects and inspect recent records |
| `installation.getGlobalDeployments` | Read global deployment profiles |
| `project.settings` / `installation.settings` | List/read bounded native setting files and XML |
| `project.deployments` | Read deployment records, IDs, mapping state and shared SSH references |
| `deployment.credentials.resolve` / `getCredentials` | Explicit saved credential lookup |
| `deployment.getRaw` | Opt-in raw native configuration |
| `PasswordSafeManager` | Low-level provider/credential inspection with explicit recovery policy |

Original library and CLI require Node 20 and remain read-only. They do not transfer files, authenticate remotely or modify IDE settings.

## Optional Portline bridge

| API | Purpose |
| --- | --- |
| `JetBrainsProfileSource.discover(options?)` | Candidate sources and explicit selection diagnostics |
| `JetBrainsProfileSource.open(options?)` | Select and load normalized profiles |
| `JetBrainsProfileSource.fromInstallation(installation, projectPath?)` | Bind an already selected installation and optional project |
| `list` / `get` / `search` | Normalized metadata queries |
| `getNativeSettings` / `resolve` | Explicit native settings and credential access |
| `createJetBrainsWriter(source, options?)` | Guarded writer with explicit global/project policy |

The bridge requires Node 22.22.2. Its writer exposes inspect, plan, `planChanges`, `importPlan`, apply and `backupPaths`. Apply is Windows-only. See [Portline writing](/guide/portline) before using a write method.
