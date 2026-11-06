import type {DefaultTheme} from 'vitepress';

export const nav: DefaultTheme.NavItem[] = [
    {
        'text': 'Overview',
        'link': '/'
    },
    {
        'text': 'API',
        'link': '/api/',
        'activeMatch': '^(?!/$|(/cli/|/reference/cli|/reference/jsbrains-help|/reference/jsbrains-output|/guide/local-demo)).+',
    },
    {
        'text': 'CLI',
        'link': '/cli/',
        'activeMatch': '^(/cli/|/reference/cli|/reference/jsbrains-help|/reference/jsbrains-output|/guide/local-demo)',
    },
    {
        'text': 'Portline family',
        'link': 'https://h2ooooooo.github.io/portline/libraries/'
    }
];

const apiSidebar: DefaultTheme.SidebarItem[] = [
    {
        'text': 'Getting started',
        'collapsed': false,
        'items': [
            {
                'text': 'API overview',
                'link': '/api/',
            },
            {
                'text': 'Installation',
                'link': '/guide/installation'
            },
            {
                'text': 'Quick start with output',
                'link': '/api/quick-start'
            },
            {
                'text': 'How it works',
                'link': '/guide/how-it-works',
            },
{'text':'Example languages and setup','link':'/guide/examples'},
{'text':'Synthetic fixture files','link':'/guide/fixtures'}
        ]
    },
    {
        'text': 'Common tasks',
        'collapsed': false,
        'items': [
            {
                'text': 'Normalized list, search and get',
                'link': '/api/profiles'
            },
{'text':'Read settings with output','link':'/api/settings-example'},
            {
                'text': 'Discover installations and projects',
                'link': '/guide/discovery'
            },
            {
                'text': 'Deployment mappings and settings',
                'link': '/guide/deployments'
            },
            {
                'text': 'Credential availability',
                'link': '/guide/credentials'
            }
        ]
    },
    {
        'text': 'Advanced usage',
        'collapsed': false,
        'items': [
            {
                'text': 'Preview, write and sync',
                'link': '/guide/writing'
            },
            {
                'text': 'Connecting a profile',
                'link': '/api/integration'
            },
            {
                'text': 'Compatibility',
                'link': '/COMPATIBILITY'
            }
        ]
    },
    {
        'text': 'API reference',
        'collapsed': true,
        'items': [
            {
                'text': 'Methods and return values',
                'link': '/reference/api'
            },
            {
                'text': 'Exact TypeScript signatures',
                'link': '/reference/types'
            },
            {
                'text': 'Implemented behavior',
                'link': '/SPEC'
            }
        ]
    },
    {
        'text': 'Contributing',
        'collapsed': true,
        'items': [
            {
                'text': 'Development',
                'link': '/development'
            }
        ]
    }
];

const cliSidebar: DefaultTheme.SidebarItem[] = [
    {
        'text': 'Getting started',
        'collapsed': false,
        'items': [
            {
                'text': 'CLI overview',
                'link': '/cli/',
            },
            {
                'text': 'Quick start with output',
                'link': '/cli/quick-start'
            },
            {
                'text': 'How it works',
                'link': '/guide/how-it-works',
            },
{'text':'Runnable fixture commands','link':'/cli/fixture-output'},
{'text':'Normalized CLI quick start','link':'/cli/profiles'},
            {
                'text': 'Repository fixture runner',
                'link': '/guide/local-demo'
            }
        ]
    },
    {
        'text': 'Commands',
        'collapsed': false,
        'items': [
            {
                'text': 'jsbrains-profiles queries',
                'link': '/cli/queries'
            },
            {
                'text': 'jsbrains inputs',
                'link': '/reference/jsbrains-help'
            },
            {
                'text': 'jsbrains output',
                'link': '/reference/jsbrains-output'
            },
            {
                'text': 'Write, sync, apply and status',
                'link': '/cli/writing'
            }
        ]
    },
    {
        'text': 'Configuration and automation',
        'collapsed': false,
        'items': [
            {
                'text': 'Source selection and output',
                'link': '/reference/cli'
            },
            {
                'text': 'JSON, errors and troubleshooting',
                'link': '/cli/automation'
            },
            {
                'text': 'Discovery rules',
                'link': '/guide/discovery'
            }
        ]
    },
    {
        'text': 'CLI reference',
        'collapsed': true,
        'items': [
            {
                'text': 'Every input and default',
                'link': '/reference/cli-help'
            },
            {
                'text': 'Captured coloured and JSON output',
                'link': '/reference/cli-output'
            }
        ]
    }
];

export const sidebar: DefaultTheme.Sidebar = {
    '/cli/': cliSidebar,
    '/reference/cli': cliSidebar,
    '/reference/jsbrains-help': cliSidebar,
    '/reference/jsbrains-output': cliSidebar,
    '/guide/local-demo': cliSidebar,
    '/': apiSidebar,
};
