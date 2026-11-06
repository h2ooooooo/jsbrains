import {defineConfig} from 'vitepress';
import {nav, sidebar} from './navigation.mjs';

export default defineConfig({
    base: process.env.DOCS_BASE ?? '/',
    'title': 'jsbrains',
    'description': 'Read JetBrains installations, projects, deployments and credential status; integrate profiles through Portline.',
    'lang': 'en-US',
    'appearance': false,
    'cleanUrls': false,
    'markdown': {
        'theme': 'github-dark-high-contrast'
    },
    'head': [
        [
            'meta',
            {
                'name': 'theme-color',
                'content': '#171a1d'
            }
        ]
    ],
    'themeConfig': {
        'siteTitle': 'jsbrains',
        'nav': nav,
        'sidebar': sidebar,
        'search': {
            'provider': 'local'
        },
        'outline': [
            2,
            3
        ],
        'socialLinks': [
            {
                'icon': 'github',
                'link': 'https://github.com/h2ooooooo/jsbrains'
            }
        ],
    }
});
