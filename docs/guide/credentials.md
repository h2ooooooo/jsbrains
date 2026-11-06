# Credentials

The recipes below use the `installation` opened in the [API quick start](/api/quick-start). Project examples additionally use `const project = await installation.getProject(projectPath)`, with `projectPath` selecting an existing project on the host.

Listing deployments does not unlock Password Safe. Credential retrieval is a separate explicit action.

::: code-group

```ts [TypeScript]
const production = await project.deployments.get('Production');

if (production) {
    const result = await production.credentials.resolve();

    if (result.status === 'available') {
        // Pass result.credentials directly to the operation that needs them.
    }
}
```

```js [JavaScript]
const production = await project.deployments.get('Production');

if (production) {
    const result = await production.credentials.resolve();

    if (result.status === 'available') {
        // Pass result.credentials directly to the operation that needs them.
    }
}
```

```js [MJS]
const production = await project.deployments.get('Production');

if (production) {
    const result = await production.credentials.resolve();

    if (result.status === 'available') {
        // Pass result.credentials directly to the operation that needs them.
    }
}
```

```js [CommonJS]
const production = await project.deployments.get('Production');

if (production) {
    const result = await production.credentials.resolve();

    if (result.status === 'available') {
        // Pass result.credentials directly to the operation that needs them.
    }
}
```

:::

The richer result distinguishes available, not-stored, master-password-required, pgp-required, locked, unsupported, unavailable and no-installation-context. `getCredentials` is a convenience returning credentials or null.

## Storage and recovery

KeePass parsing is delegated to the documented third-party runtime. Supported Windows recovery requires the same owning user and DPAPI context. A caller can supply a master-password callback when automatic recovery is unavailable. Native macOS/Linux password stores and unsupported plugin identifiers are not represented as recoverable credentials.

OpenSSH credential results delegate authentication to the consumer; the library does not extract agent keys. Saved passwords and key passphrases are separate shapes. Review the researched format and third-party details in [compatibility](/COMPATIBILITY).

## CLI redaction

~~~sh
jsbrains credentials Production --product PhpStorm --json
jsbrains deployments --credentials --product PhpStorm --json
~~~

Values are hidden by default. `--show-secrets` is accepted only for an explicit credential request. Master-password input can use the documented environment-variable or piped-stdin options; it is never an ordinary command-line password argument. Avoid logs and shared files when intentionally exporting secrets.

Use the [CLI reference](/reference/cli) for exact flags and exit statuses. A successful local lookup does not prove remote login works.
