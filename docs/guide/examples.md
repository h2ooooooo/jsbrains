# Example languages and setup

Complete programs have matching source and run-command tabs: **TypeScript**, **JavaScript**, **MJS**, **CommonJS**. A fresh page selects TypeScript. Selecting another language changes the matching command tabs and preserves that choice while navigating.

## Prepare a directory

Create an empty working directory, run `npm init -y` and install the package named on the example page. Then select the language setup:

::: code-group

```sh [TypeScript]
npm pkg set type=module
npm install --save-dev typescript tsx @types/node
```

```sh [JavaScript]
npm pkg set type=module
```

```sh [MJS]
# The .mjs extension explicitly selects ES modules.
```

```sh [CommonJS]
# The .cjs extension explicitly selects CommonJS.
```

:::

Save the selected code tab's filename and the linked [synthetic settings](/guide/fixtures). Run the command from that directory. The examples inspect files on the host without connecting to their saved endpoints.

The original SDK supports Node.js 20+, with ESM and CommonJS exports. The optional bridge and profile command require Node.js 22.22.2+. Every package includes TypeScript declarations. Use `npm.cmd`/`npx.cmd` in PowerShell if execution policy blocks their PowerShell wrappers.

Contextual recipes explicitly name the complete program supplying their variables. Exact type declarations remain TypeScript-only. Repository fixture scripts retain their actual development filenames.

CommonJS complete programs define an async `main` function. Contextual CommonJS snippets containing `await` belong inside that function; they are not standalone top-level CommonJS programs.
