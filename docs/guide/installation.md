# Installation

Install the original SDK and, optionally, the original command:

~~~sh
npm install @jalsoedesign/jsbrains@rc
npm install --global @jalsoedesign/jsbrains-cli@rc
~~~

They require Node.js 20 or newer. The library provides ESM and CommonJS exports and TypeScript declarations.

For normalized profiles and guarded settings writing, add the optional bridge:

~~~sh
npm install @jalsoedesign/jsbrains-portline@rc
npm install --global @jalsoedesign/jsbrains-portline-cli@rc
~~~

The bridge and jsbrains-profiles require Node 22.22.2. The original API and command remain read-only.



Continue with [the original SDK quick start](/api/quick-start), [the original CLI](/cli/quick-start) or [the optional profile bridge](/guide/portline). [Language setup](/guide/examples) covers the matching source and run-command tabs. Install only packages imported directly by the code or the executable needed.

## Optional connection execution

The reader and CLI keep their existing dependencies. Add the shared integration only for an explicit connection:

```sh
npm install @jalsoedesign/jsbrains-portline@rc @jalsoedesign/portline-dockline@rc @jalsoedesign/dockline-sftp-client@rc
```

Install `@jalsoedesign/dockline-ftp-client` for FTP/FTPS, `dockline-sftp-client` for SFTP or `dockline-ssh-client` for SSH commands. These are shared clients, not application-specific connector packages. Follow [the complete scoped example](/api/integration) for exact source selection, authentication and host verification. Installing this SDK integration adds no network subcommands to the reader CLI.
