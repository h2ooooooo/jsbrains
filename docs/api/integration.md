# Connect a selected profile

The original jsbrains API and command remain read-only and support Node 20+. The optional bridge and jsbrains-profiles require Node 22.22.2 or newer. No reader opens an SSH, transfer or database session.

## Inspect the selected connection

::: code-group

```ts [TypeScript]
const profile = source.get('global/deployments/demo');

if (!profile) {
    throw new Error('Profile not found');
}

for (const connection of profile.connections) {
    console.log(connection.id, connection.protocol);
}

console.log(profile.diagnostics);
```

```js [JavaScript]
const profile = source.get('global/deployments/demo');

if (!profile) {
    throw new Error('Profile not found');
}

for (const connection of profile.connections) {
    console.log(connection.id, connection.protocol);
}

console.log(profile.diagnostics);
```

```js [MJS]
const profile = source.get('global/deployments/demo');

if (!profile) {
    throw new Error('Profile not found');
}

for (const connection of profile.connections) {
    console.log(connection.id, connection.protocol);
}

console.log(profile.diagnostics);
```

```js [CommonJS]
const profile = source.get('global/deployments/demo');

if (!profile) {
    throw new Error('Profile not found');
}

for (const connection of profile.connections) {
    console.log(connection.id, connection.protocol);
}

console.log(profile.diagnostics);
```

:::


This fragment uses a source opened in the [bridge example](/guide/portline) and an exact returned path. Output depends on that native profile; it can contain more than one connection.

## Supply execution deliberately

A normalized Portline profile is not a Dockline configuration object. Your integration must select a supported connection, map its endpoint and options, choose explicit credential resolution and verify server identity. SSH-hop references describe relationships; they are not an automatically executed tunnel chain.

Use [Dockline's API documentation](https://h2ooooooo.github.io/dockline/api/) for generic transfers, SSH execution and key conversion. Do not pass an arbitrary profile directly to `Dockline.connect` or treat raw native settings as transport options. Portline's [connector registry](https://h2ooooooo.github.io/portline/integration/reference/api) lets a host register its own providers; it is not a universal built-in mapper.

Read operations do not validate that a host is reachable, a key file exists or authentication will succeed. Unsupported metadata and diagnostics remain meaningful to the integration.
