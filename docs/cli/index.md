# CLI documentation

Choose `jsbrains` for read-only IDE inspection or `jsbrains-profiles` for normalized queries and guarded writing. They have separate installation and output contracts.

## Start here

- [CLI quick start](/cli/quick-start): install, save synthetic settings, run a command and compare its output.
- [Fixture commands and output](/cli/fixture-output): JSON, actual colours and a missing-profile error.
- [Normalized profile command](/cli/profiles): the optional `jsbrains-profiles` executable.
- [Original JSON envelope](/cli/original-output): actual `jsbrains` output.

## Commands and automation

[Writing commands](/cli/writing) separate preview from apply. [Automation and troubleshooting](/cli/automation) cover output streams and exit handling. Use the [complete inputs](/reference/cli-help) and [captured output reference](/reference/cli-output) for all profile-command cases. The original command has its own [inputs](/reference/jsbrains-help), [outputs](/reference/jsbrains-output) and [contract](/reference/cli).

Commands inspect or explicitly change local settings; they do not open an SSH, transfer or database session. For code, use [API documentation](/api/).
