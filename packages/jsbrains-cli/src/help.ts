export const help = {
   usage: 'jsbrains [command] [options]',
   commands: {
      inspect: 'Overview of installations and the current project (default).',
      installations: 'List detected IDE configuration installations.',
      projects: 'List recent projects for the selected IDE.',
      project: 'Show the current/selected project and default deployment state.',
      deployments: 'List deployments; optionally select a name or --id.',
      credentials: 'Test retrieval for a deployment name, --id, or --all.',
      'password-safe': 'Show the selected IDE password-store configuration without unlocking it.',
      settings: 'List project settings files, or read one by filename; --global selects IDE settings.',
      help: 'Show this help.',
      version: 'Show package version.'
   },
   options: {
      '--json': 'One schema-versioned JSON document; errors are JSON on stderr.',
      '--product PRODUCT': 'Select a product, e.g. PhpStorm; defaults to its latest version.',
      '--ide-version VERSION': 'Select a specific IDE version.',
      '--config PATH, -c PATH': 'Use an exact IDE configuration directory.',
      '--project PATH, -p PATH': 'Find .idea at this path or a parent (default: current directory).',
      '--scope all|project|global': 'Deployment scope; defaults to all when a project exists.',
      '--global': 'Global deployments/credentials, or IDE settings.',
      '--name NAME, -n NAME / --id ID': 'Select a deployment exactly; ambiguous matches require --scope.',
      '--credentials': 'With deployments, also resolve credential statuses.',
      '--all': 'With credentials, explicitly test all matching deployments.',
      '--show-secrets': 'Explicitly include retrieved passwords/passphrases in command output.',
      '--master-password-env NAME': 'Read a fallback master password from this environment variable.',
      '--master-password-stdin': 'Read a fallback master password from piped stdin (one trailing newline removed).',
      '--color / --no-color': 'Force or disable Chalk colors; --json is always color-free.',
      '--help, -h / --version, -v': 'Show help or version.'
   },
   examples: [
      'jsbrains --json',
      'jsbrains deployments --product PhpStorm',
      'jsbrains deployments --project "<project-directory>" --json',
      'jsbrains credentials "Production" --product PhpStorm --scope project',
      'jsbrains credentials --all --product PhpStorm --json',
      'jsbrains credentials "Production" --show-secrets --json',
      'jsbrains settings deployment.xml --project "<project-directory>" --json'
   ],
   exitCodes: {'0': 'Success (including empty listings).', '1': 'Read/parse or unexpected failure.', '2': 'Invalid arguments, missing selection, or ambiguous selection.', '3': 'Credential test completed with one or more unavailable credentials.'},
   note: 'Credential retrieval checks local storage only. It does not log in to a remote server. OpenSSH availability does not mean a password was retrieved.'
};
