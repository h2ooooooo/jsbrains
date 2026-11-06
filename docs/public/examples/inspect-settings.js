// inspect-settings.js
import {JetBrains} from '@jalsoedesign/jsbrains';

const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
const files = await installation.settings.listFiles();
const servers = await installation.settings.readXml('webServers.xml');

console.log('Settings files: ' + files.length);
console.log('Deployment XML found: ' + Boolean(servers));
console.log('Raw settings contents omitted from output.');
