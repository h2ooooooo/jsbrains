# Installation

Install the original SDK and, optionally, the original command:

~~~sh
npm install @jalsoedesign/jsbrains
npm install --global @jalsoedesign/jsbrains-cli
~~~

They require Node.js 20 or newer. The library provides ESM and CommonJS exports and TypeScript declarations.

For normalized profiles and guarded settings writing, add the optional bridge:

~~~sh
npm install @jalsoedesign/jsbrains-portline
npm install --global @jalsoedesign/jsbrains-portline-cli
~~~

The bridge and jsbrains-profiles require Node 22.22.2. The original API and command remain read-only.



Continue with [the original SDK quick start](/api/quick-start), [the original CLI](/cli/quick-start) or [the optional profile bridge](/guide/portline). [Language setup](/guide/examples) covers the matching source and run-command tabs. Install only packages imported directly by the code or the executable needed.
