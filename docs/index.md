---
layout: home
hero:
  name: jsbrains
  text: Use the deployment settings already in the IDE.
  tagline: Read JetBrains deployments, SSH settings and mappings from code or the terminal.
  actions:
    - theme: brand
      text: API documentation
      link: /api/
    - theme: alt
      text: CLI documentation
      link: /cli/
---

Source code: [GitHub repository](https://github.com/h2ooooooo/jsbrains).

The IDE already has the server details and mappings used for deployments. jsbrains makes that saved configuration available to scripts and tooling, so those details can be reused without maintaining another copy. Start with the original SDK for IDE-specific reads or use the optional Portline bridge for normalized profiles and guarded writing.

[How it works](/guide/how-it-works) explains where settings are read, how the native format is interpreted and what happens on the host.

## Start with a working example

| Goal | Start here |
| --- | --- |
| Read settings from code | [API quick start with output](/api/quick-start) |
| Inspect settings from a terminal | [CLI quick start with output](/cli/quick-start) |
| Try everything without installed settings | [Synthetic fixtures](/guide/fixtures) |
| Preview a supported settings change | [Preview, review and apply](/guide/writing) |
| Use normalized profiles alongside the original SDK | [Optional Portline bridge](/guide/portline) |

## What the library does

The original SDK exposes IDE installations, projects, deployments, mappings and explicit credential lookup. The optional bridge adds normalized profiles and guarded native writing.

Read operations describe saved metadata without opening a remote session. Use [Dockline](https://h2ooooooo.github.io/dockline/) for transfers/SSH and [Dockline Keys](https://h2ooooooo.github.io/dockline/keys/) for key loading and conversion.

Part of the [Portline family](https://h2ooooooo.github.io/portline/libraries/), with each application library maintained in its own repository.
