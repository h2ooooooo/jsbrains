// preview-profile.ts
import {JetBrainsProfileSource, createJetBrainsWriter} from '@jalsoedesign/jsbrains-portline';

const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});
const selected = source.get('global/deployments/demo');

if (!selected) {
    throw new Error('The demo profile is missing');
}

// Plan a new saved profile in the same synthetic settings; do not apply it.
const targetPath = 'global/deployments/imported';
const writer = createJetBrainsWriter(source.source, {mode: 'create'});
const preview = await writer.plan([{
    ...selected,
    path: targetPath,
    name: 'Imported',
}]);

console.log('Source profile: ' + selected.path);
console.log('Destination profile: ' + targetPath);
console.log('Planned operations: ' + preview.changes.map(change => change.operation).join(', '));
console.log('Native settings written: no');
