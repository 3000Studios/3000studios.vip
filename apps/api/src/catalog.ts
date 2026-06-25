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
    workspaceKey: '3000studios.vip',
    workspacePath: 'C:\\WorkSpaces\\3000studios.vip',
    zoneName: '3000studios.vip',
    bridgeEnabled: true,
    editSurfaces: ['/', '/vault', '/vault/sites', '/vault/ops', '/vault/settings'],
  },
  {
    name: 'Swain Pro',
    origin: 'https://swain.pro',
    workspaceKey: 'Swain-Pro',
    workspacePath: 'C:\\WorkSpaces\\Swain-Pro',
    zoneName: 'swain.pro',
    bridgeEnabled: true,
    editSurfaces: ['/', '/contact', '/services'],
  },
  {
    name: 'My App AI',
    origin: 'https://myappai.net',
    workspaceKey: 'myappai',
    workspacePath: 'C:\\WorkSpaces\\myappai',
    zoneName: 'myappai.net',
    bridgeEnabled: true,
    editSurfaces: ['/', '/dashboard', '/admin'],
  },
  {
    name: 'Pondco Online',
    origin: 'https://pondco.online',
    workspaceKey: 'pondco-online',
    workspacePath: 'C:\\WorkSpaces\\pondco-online',
    zoneName: 'pondco.online',
    bridgeEnabled: true,
    editSurfaces: ['/', '/projects', '/contact'],
  },
  {
    name: 'Calistique',
    origin: 'https://calistique.xyz',
    workspaceKey: 'Calistique',
    workspacePath: 'C:\\WorkSpaces\\Calistique',
    zoneName: 'calistique.xyz',
  },
  {
    name: 'Camp Dream',
    origin: 'https://campdreamga.com',
    workspaceKey: 'campdreamga-com',
    workspacePath: 'C:\\WorkSpaces\\campdreamga-com',
    zoneName: 'campdreamga.com',
  },
  {
    name: 'Camp Dream Store',
    origin: 'https://campdream.store',
    workspaceKey: 'campdream-store',
    workspacePath: 'C:\\WorkSpaces\\campdream-store',
    zoneName: 'campdream.store',
  },
  {
    name: 'Find Me Rates',
    origin: 'https://findmerates.com',
    workspaceKey: 'findmerates-com',
    workspacePath: 'C:\\WorkSpaces\\findmerates-com',
    zoneName: 'findmerates.com',
  },
  {
    name: 'Referrals Live',
    origin: 'https://referrals.live',
    workspaceKey: 'referrals-live',
    workspacePath: 'C:\\WorkSpaces\\referrals-live',
    zoneName: 'referrals.live',
  },
  {
    name: 'The Cajun Menu',
    origin: 'https://thecajunmenu.site',
    workspaceKey: 'thecajunmenu-site',
    workspacePath: 'C:\\WorkSpaces\\thecajunmenu-site',
    zoneName: 'thecajunmenu.site',
  },
  {
    name: 'The United States',
    origin: 'https://theunitedstates.site',
    workspaceKey: 'theunitedstates-site',
    workspacePath: 'C:\\WorkSpaces\\theunitedstates-site',
    zoneName: 'theunitedstates.site',
  },
  {
    name: 'Tmack48',
    origin: 'https://tmack48.com',
    workspaceKey: 'tmack48.com',
    workspacePath: 'C:\\WorkSpaces\\tmack48.com',
    zoneName: 'tmack48.com',
  },
];

