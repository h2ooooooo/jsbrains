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

## Optional shared execution APIs

`@jalsoedesign/portline-dockline` supplies `createDocklineBridge`, `DocklineBridge` and `ProfileExecutionError`. These are separate package exports, not exports of the native reader. Its `withFiles`, `withSsh`, `toConfig`, `toSshConfig` and `createFileAdapter` methods accept the normalized profiles described above. See [the actual source-to-session example and option table](/api/integration). Profile parsing stays metadata-only; execution and credential lookup are explicit.

### Normalized execution fields

The shared contract can represent the following fields. A reader emits only the native settings it can interpret faithfully; inspect `unsupportedOptions` and diagnostics before execution.

| Field | Meaning for the shared mapper |
| --- | --- |
| `connections[].id`, `kind`, `protocol`, `endpoint` | Exact connection selection and endpoint/capability validation. |
| `authentication` | Credential references, private-key metadata, agent selection, anonymous FTP or explicit unsupported methods. |
| `prompt-password` versus `interactive` | A password prompt differs from SSH keyboard-interactive authentication. |
| `filenameEncoding`, FTP `passive` and `tls` | Supported filename/FTP settings; ambiguous TLS requires a deliberate runtime choice. |
| SSH `trust.fingerprints` | Optional canonical SHA256 pin metadata, not permission to persist a trust decision. |
| `unsupportedOptions` | Native requirements that the shared bridge refuses rather than ignoring. |
| `via` | Saved SSH-hop relationships; the current shared execution bridge refuses automatic hop setup. |

These records are not raw Dockline configuration and contain no secret values. The shared mapper supplies executable configuration only when explicitly requested. Guarded writing remains a separate operation and does not copy runtime trust or authentication callbacks.
