# Read, select and search

For IDE-specific objects start with the [original SDK quick start](/api/quick-start). The normalized recipes below continue the [Portline bridge example](/guide/portline). Reuse its `source` variable; these are contextual snippets rather than separate programs.

## List saved paths

::: code-group

```ts [TypeScript]
const paths = source.list().map(profile => profile.path);

console.log(paths.join(', '));
```

```js [JavaScript]
const paths = source.list().map(profile => profile.path);

console.log(paths.join(', '));
```

```js [MJS]
const paths = source.list().map(profile => profile.path);

console.log(paths.join(', '));
```

```js [CommonJS]
const paths = source.list().map(profile => profile.path);

console.log(paths.join(', '));
```

:::

```text
global/deployments/demo, global/ssh/demo-ssh
```

## Select a profile

::: code-group

```ts [TypeScript]
const profile = source.get('global/deployments/demo');

console.log(profile?.connections[0]?.endpoint.host ?? 'Profile not found');
```

```js [JavaScript]
const profile = source.get('global/deployments/demo');

console.log(profile?.connections[0]?.endpoint.host ?? 'Profile not found');
```

```js [MJS]
const profile = source.get('global/deployments/demo');

console.log(profile?.connections[0]?.endpoint.host ?? 'Profile not found');
```

```js [CommonJS]
const profile = source.get('global/deployments/demo');

console.log(profile?.connections[0]?.endpoint.host ?? 'Profile not found');
```

:::

```text
127.0.0.1
```

Selection uses an exact canonical path, including folders or scope where present. It is not a path to a file on the host. A missing path returns `undefined`.

## Search metadata

::: code-group

```ts [TypeScript]
const matches = source.search('127.0.0.1', {fields: 'all'});

console.log('Matches: ' + matches.length);
```

```js [JavaScript]
const matches = source.search('127.0.0.1', {fields: 'all'});

console.log('Matches: ' + matches.length);
```

```js [MJS]
const matches = source.search('127.0.0.1', {fields: 'all'});

console.log('Matches: ' + matches.length);
```

```js [CommonJS]
const matches = source.search('127.0.0.1', {fields: 'all'});

console.log('Matches: ' + matches.length);
```

:::

```text
Matches: 2
```

Search is case-insensitive. Default search uses names/paths; `fields: 'all'` includes supported connection metadata. It does not resolve credential values.

## Snapshots and diagnostics

Reopen the source to refresh changed settings. Inspect connection kinds and diagnostics before assuming a native option has a supported transport equivalent. Raw native settings are opt-in and can contain sensitive data. See [API contracts](/reference/api) and [execution boundaries](/api/integration).
