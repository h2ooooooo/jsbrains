# Discovery and projects

The recipes below use the `installation` opened in the [API quick start](/api/quick-start). Project examples additionally use `const project = await installation.getProject(projectPath)`, with `projectPath` selecting an existing project on the host. Discovery recipes create their own `ide` with `await JetBrains.detect()`; they inspect installed configurations rather than the synthetic fixture.

`JetBrains.detect` inspects normal Windows AppData, macOS Library and Linux XDG configuration locations. An options directory is required; cache-only folders are excluded. Product names and numeric versions remain visible rather than being inferred from IDE processes.

::: code-group

```ts [TypeScript]
const ide = await JetBrains.detect();
const installations = await ide.getInstallations();
const custom = await JetBrains.fromConfigPath('<config-directory>');
const current = await JetBrains.findProject({from: process.cwd()});
```

```js [JavaScript]
const ide = await JetBrains.detect();
const installations = await ide.getInstallations();
const custom = await JetBrains.fromConfigPath('<config-directory>');
const current = await JetBrains.findProject({from: process.cwd()});
```

```js [MJS]
const ide = await JetBrains.detect();
const installations = await ide.getInstallations();
const custom = await JetBrains.fromConfigPath('<config-directory>');
const current = await JetBrains.findProject({from: process.cwd()});
```

```js [CommonJS]
const ide = await JetBrains.detect();
const installations = await ide.getInstallations();
const custom = await JetBrains.fromConfigPath('<config-directory>');
const current = await JetBrains.findProject({from: process.cwd()});
```

:::

Use `configPaths` during detection or `fromConfigPath` for custom idea.config.path locations. The SDK does not search arbitrary executables or launcher arguments. Matching standard cache directories may appear as `systemPath`.

## Project scope

installation.getProject(path) binds the project to an IDE configuration. `JetBrainsProject` can also represent a standalone .idea folder. findProject walks upward to a .idea folder or the filesystem root.

Recent project records preserve missing paths, recorded names and optional last-opened metadata. Their exists field is a snapshot; await project.exists() checks the current filesystem.

Inject platform, `homePath` and env for tests or imported configurations. Native credential operations still require the actual owning OS and user. The Portline bridge reports ambiguous installations and requires a source/config selection rather than pretending a versioned directory identifies the running IDE.
