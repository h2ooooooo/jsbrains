# Compatibility and implementation evidence

Research date: 2026-09-11. Public JetBrains source inspected at commit `803de49279c5f443419bf808364e22d1276a8194` in `JetBrains/intellij-community`. Internal persistence formats are not a public interchange contract; unknown data is preserved through explicit raw access.

## Credential bootstrap

Source references, pinned to the inspected revision:

- [mainKey.kt](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/credential-store-impl/src/credentialStore/keePass/mainKey.kt): `c.pwd` stores encryption metadata and a base64 binary value. The legacy fallback is `pdb.pwd`.
- [EncryptionSupport.kt](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/credential-store-impl/src/credentialStore/EncryptionSupport.kt): `BUILT_IN` uses AES-128-CBC/PKCS padding; its envelope contains a four-byte big-endian IV length, IV, and ciphertext. The fixed compatibility key is `Proxy Config Sec`. `CRYPT_32` wraps the entire AES envelope in DPAPI. `PGP_KEY` is separate.
- [WindowsCryptUtils.java](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/credential-store-impl/src/credentialStore/windows/WindowsCryptUtils.java): DPAPI decryption uses no additional entropy. jsbrains invokes .NET CurrentUser unprotection through a fixed, noninteractive PowerShell script, passing the encrypted input over stdin and hiding the child window.
- [KeePassCredentialStore.kt](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/credential-store-impl/src/credentialStore/keePass/KeePassCredentialStore.kt): default database and main key are in the original config directory. Generated main keys are password bytes, not KeePass key files.
- [PasswordSafeSettings.kt](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/credential-store-impl/src/credentialStore/PasswordSafeSettings.kt): `options/security.xml`, component `PasswordSafe`, provider `PROVIDER`, custom `keepassDb`, and Windows KEYCHAIN-to-KEEPASS behavior.

Only the small JetBrains bootstrap envelope is reproduced. KeePass parsing and cryptography are delegated to [kdbxweb](https://github.com/keeweb/kdbxweb), with [hash-wasm](https://github.com/Daninet/hash-wasm) for Argon2 version 1.3. Generated fixture tests cover KDBX3, KDBX4, password failures, exact entry lookup, AES bootstrap, legacy files, and Windows DPAPI.

KDF limits: Argon2 memory at most 256 MiB, at most 100 iterations, parallelism at most 16, output at most 1024 bytes. Older Argon2 versions are unsupported. These limits are compatibility restrictions, not a comprehensive hostile-file sandbox.

## Credential identities

- [RemoteCredentialsHolder.java](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/remote-core/src/remote/RemoteCredentialsHolder.java): identity `ssh://username@host:literalPort`; qualifiers `password`, `passphrase`, and `empty`.
- [CredentialAttributes.kt](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/credential-store/src/credentialStore/CredentialAttributes.kt): service prefix `IntelliJ Platform`.
- [BaseKeePassCredentialStore.kt](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/credential-store-impl/src/credentialStore/keePass/BaseKeePassCredentialStore.kt): entries in the `IntelliJ Platform` group, exact service title plus username when provided.

The resulting supported title is `IntelliJ Platform Remote Credentials ssh://username@host:port(password)` or the corresponding `(passphrase)` title. Literal port formatting is retained. Username and host are not case-folded, trimmed, URL-encoded, or fuzzily matched.

The commercial deployment/SSH plugins are not fully represented in the public community source. Reading a shared SSH configuration does not prove every plugin version uses `RemoteCredentialsHolder` for its stored secret. Unsupported protocols have no guessed service key. A mismatch can return `not-stored`; callers can provide a verified exact key through the low-level Password Safe API.

## Deployment fixtures

The shape of `WebServers` / `option servers` / `webServer` / `fileTransfer`, shared `SshConfigs`, and `PublishConfigData` mapping entries is based on the [configuration example on JetBrains' support site](https://intellij-support.jetbrains.com/hc/zh-cn/community/posts/7373157620882-I-generate-correct-deployment-config-by-script-but-deployment-throws-ssh-error). A JetBrains support representative reviewed the example there.

Committed fixtures use synthetic hosts, IDs, usernames, paths and secrets. They are not copies of an installed application’s configuration.

Protocol/authentication variants are fixture coverage, not a claim that every emitted variant has been tested against a live IDE. Unknown types and attributes are retained; unsupported auto-upload values are not normalized speculatively. The `useOpenSSHConfig` flag is independent of authentication type, as confirmed by `RemoteCredentialsHolder` and the [SSH settings documentation](https://www.jetbrains.com/help/phpstorm/create-ssh-configurations.html).

## Discovery and settings references

- [IDE directories](https://www.jetbrains.com/help/phpstorm/directories-used-by-the-ide-to-store-settings-caches-plugins-and-logs.html): standard configuration/cache roots and custom path properties.
- [Passwords](https://www.jetbrains.com/help/phpstorm/reference-ide-settings-password-safe.html): KeePass, native stores, master passwords, and PGP options.
- [RecentProjectsManagerBase.kt](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/platform-impl/src/com/intellij/ide/RecentProjectsManagerBase.kt): recent project state implementation.

Custom launch properties, remote development, legacy pre-2020 directory conventions, and native macOS/Linux credential stores are outside this first implementation. Explicit config paths remain supported.

## Dependency packaging

The pinned kdbxweb 2.1.1 published source is bundled into the original jsbrains library during its build. Its gzip/gunzip imports use a narrow Node zlib adapter; the prebuilt distribution and its embedded ZIP implementation are excluded. The DOM implementation is externalized as the direct @xmldom/xmldom dependency; consumers do not need a repository-local override. The original library’s manifest declares its runtime dependencies, while kdbxweb remains an exact development/build dependency with retained MIT, source-map and provenance notices. The build verifies the source entry and absence of the old bundled ZIP code.

ESLint, Vitest/Vite, TypeScript and the build tools are development dependencies, not SDK transport or credential-store features. Their current ranges live in the root manifest. The separately installed VitePress documentation has its own manifest and lockfile. Version ranges and audit results should be checked from those sources rather than inferred from a historical research date.
