# Settings and deployments

The recipes below use the `installation` opened in the [API quick start](/api/quick-start). Project examples additionally use `const project = await installation.getProject(projectPath)`, with `projectPath` selecting an existing project on the host.

## Read settings explicitly

::: code-group

```ts [TypeScript]
const files = await project.settings.listFiles();
const workspace = await project.settings.read('workspace.xml');
const mappings = await project.settings.readXml('deployment.xml');
const servers = await installation.settings.read('webServers.xml');
```

```js [JavaScript]
const files = await project.settings.listFiles();
const workspace = await project.settings.read('workspace.xml');
const mappings = await project.settings.readXml('deployment.xml');
const servers = await installation.settings.read('webServers.xml');
```

```js [MJS]
const files = await project.settings.listFiles();
const workspace = await project.settings.read('workspace.xml');
const mappings = await project.settings.readXml('deployment.xml');
const servers = await installation.settings.read('webServers.xml');
```

```js [CommonJS]
const files = await project.settings.listFiles();
const workspace = await project.settings.read('workspace.xml');
const mappings = await project.settings.readXml('deployment.xml');
const servers = await installation.settings.read('webServers.xml');
```

:::

Filenames are single names within .idea or the installation's options directory. Traversal and escaping symlinks are refused. Missing files return null. `listFiles` reports names and existence without parsing contents; `getFiles` reads content and parses XML. DTD/entity declarations are rejected.

Read results include filename, absolute path, existence, raw text and parsed XML where relevant. Attributes use the @_ prefix and values remain strings. Malformed XML is reported without copying configuration content into error messages.

## Read deployments and mappings

::: code-group

```ts [TypeScript]
const deployments = await project.deployments.getAll();
const production = await project.deployments.get('Production');
const byId = await project.deployments.getById('server-id');
const global = await installation.getGlobalDeployments();
```

```js [JavaScript]
const deployments = await project.deployments.getAll();
const production = await project.deployments.get('Production');
const byId = await project.deployments.getById('server-id');
const global = await installation.getGlobalDeployments();
```

```js [MJS]
const deployments = await project.deployments.getAll();
const production = await project.deployments.get('Production');
const byId = await project.deployments.getById('server-id');
const global = await installation.getGlobalDeployments();
```

```js [CommonJS]
const deployments = await project.deployments.getAll();
const production = await project.deployments.get('Production');
const byId = await project.deployments.getById('server-id');
const global = await installation.getGlobalDeployments();
```

:::

Project entries precede global entries. Duplicate names/IDs remain separate; exact get/getById returns the first match. Filter `includeProject`/`includeGlobal` when scope matters.

Deployments expose protocol, host, port, username, root path, web URL, authentication metadata, mappings, source paths and diagnostics. `getRaw` is explicit and can include sensitive native fields.

Mappings are associated by server ID where present, otherwise exact name. Supported project/user/config macros expand only when their context exists. Unresolved macros remain visible with diagnostics. Shared SSH references use exact IDs and project-before-global precedence.

The reader does not read key contents or execute OpenSSH commands. Unverified automatic-upload options remain unknown rather than being guessed. See [API signatures](/reference/types) and [compatibility](/COMPATIBILITY).

## Settings output is not a universal secret sanitizer

The original CLI redacts recognized password, passphrase, token, secret and private-key-content names in parsed XML. It returns non-XML settings as text, and unfamiliar secret field names may remain visible. This is separate from credential-command redaction; `--show-secrets` is not a general gate for raw settings contents. SDK settings reads and `getRaw` are explicit native-data access and can also expose sensitive fields.
