# First release candidate

Historical prerelease notes. See [Stable release](RELEASE.md) for the current stable versions.

This release uses the `rc` npm tag. Existing stable `latest` tags remain unchanged. Install this candidate explicitly:

```sh
npm install @jalsoedesign/jsbrains@rc @jalsoedesign/jsbrains-cli@rc @jalsoedesign/jsbrains-portline@rc @jalsoedesign/jsbrains-portline-cli@rc
```

| Package | Candidate |
| --- | --- |
| `@jalsoedesign/jsbrains` | `1.0.0-rc.1` |
| `@jalsoedesign/jsbrains-cli` | `1.0.0-rc.1` |
| `@jalsoedesign/jsbrains-portline` | `1.0.0-rc.1` |
| `@jalsoedesign/jsbrains-portline-cli` | `1.0.0-rc.1` |

Family dependencies explicitly include the candidate versions. A stable range such as `^1.0.0` does not accept `1.0.0-rc.1`.

Saved profiles use the shared `@jalsoedesign/portline-dockline` execution bridge. Install the FTP, SFTP or SSH Dockline handler required by the operation. Reader packages continue to work without execution handlers.

For SSH and SFTP through the bridge, an interactive terminal asks you to confirm unknown fingerprints by default. Explicit pins and trust callbacks take priority. Unattended jobs require configured trust. Default bridge approvals last for that bridge instance and are not written to disk.
