export interface NavItem {
  title: string;
  slug: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const docsNav: NavSection[] = [
  {
    label: 'Getting Started',
    items: [
      { title: 'Installation', slug: 'installation' },
      { title: 'Getting Started', slug: 'getting-started' },
      { title: 'Configuration', slug: 'configuration' },
      { title: 'Runner Setup', slug: 'runners' },
    ],
  },
  {
    label: 'Design',
    items: [
      { title: 'Overview', slug: 'design/README' },
      { title: 'Vision', slug: 'design/vision' },
      { title: 'Architecture', slug: 'design/architecture' },
      { title: 'Glossary', slug: 'design/glossary' },
      { title: 'Planner', slug: 'design/planner' },
      { title: 'Execution', slug: 'design/execution' },
      { title: 'GitHub Integration', slug: 'design/github-integration' },
      { title: 'Roadmap', slug: 'design/roadmap' },
    ],
  },
  {
    label: 'Examples',
    items: [
      { title: 'Overview', slug: 'examples/README' },
      { title: 'Solo Developer', slug: 'examples/solo-dev' },
      { title: 'Small Team', slug: 'examples/small-team' },
      { title: 'CI-Heavy', slug: 'examples/ci-heavy' },
    ],
  },
];
