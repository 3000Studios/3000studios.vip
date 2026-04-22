export type CatalogSite = {
  name: string;
  origin: string;
  workspaceKey: string;
  workspacePath: string;
  zoneName?: string;
  bridgeEnabled?: boolean;
  editSurfaces?: string[];
};

export const catalogSites: CatalogSite[] = [
  {
    name: '3000 Studios VIP',
    origin: 'https://3000studios.vip',
    workspaceKey: '3000studios-vip',
    workspacePath: 'C:\\Workspaces\\3000studios-vip',
    zoneName: '3000studios.vip',
    editSurfaces: ['/dashboard', '/admin', '/products', '/pricing', '/blog', '/contact'],
  },
  {
    name: 'VoiceToWebsite',
    origin: 'https://voicetowebsite.com',
    workspaceKey: 'voicetowebsite-copyright-mrjwswain',
    workspacePath: 'C:\\Workspaces\\voicetowebsite-copyright-mrjwswain',
    bridgeEnabled: true,
    editSurfaces: ['/dashboard', '/admin', '/products', '/pricing', '/blog', '/contact'],
  },
  {
    name: 'Calistique',
    origin: 'https://calistique.xyz',
    workspaceKey: 'Calistique',
    workspacePath: 'C:\\Workspaces\\Calistique',
    zoneName: 'calistique.xyz',
  },
  {
    name: 'Camp Dream',
    origin: 'https://campdreamga.com',
    workspaceKey: 'campdreamga-com',
    workspacePath: 'C:\\Workspaces\\campdreamga-com',
    zoneName: 'campdreamga.com',
  },
  {
    name: 'Camp Dream Store',
    origin: 'https://campdream.store',
    workspaceKey: 'campdream-store',
    workspacePath: 'C:\\Workspaces\\campdream-store',
    zoneName: 'campdream.store',
  },
  {
    name: 'Find Me Rates',
    origin: 'https://findmerates.com',
    workspaceKey: 'findmerates-com',
    workspacePath: 'C:\\Workspaces\\findmerates-com',
    zoneName: 'findmerates.com',
  },
  {
    name: 'Referrals Live',
    origin: 'https://referrals.live',
    workspaceKey: 'referrals-live',
    workspacePath: 'C:\\Workspaces\\referrals-live',
    zoneName: 'referrals.live',
  },
  {
    name: 'The Cajun Menu',
    origin: 'https://thecajunmenu.site',
    workspaceKey: 'thecajunmenu-site',
    workspacePath: 'C:\\Workspaces\\thecajunmenu-site',
    zoneName: 'thecajunmenu.site',
  },
  {
    name: 'The United States',
    origin: 'https://theunitedstates.site',
    workspaceKey: 'theunitedstates-site',
    workspacePath: 'C:\\Workspaces\\theunitedstates-site',
    zoneName: 'theunitedstates.site',
  },
  {
    name: 'Tmack48',
    origin: 'https://tmack48.com',
    workspaceKey: 'tmack48.com',
    workspacePath: 'C:\\Workspaces\\tmack48.com',
    zoneName: 'tmack48.com',
  },
];

