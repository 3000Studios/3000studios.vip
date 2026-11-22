/**
 * Suno has no supported public upload API on this machine.
 * Adapter is manual: write the generation package and wait for human drop + approval.
 */
export type SunoPackage = {
  title: string;
  lyrics: string;
  style_of_music: string;
  avoid: string;
};

export type SunoAdapterResult = {
  mode: 'manual';
  package: SunoPackage;
  next: 'human_listens_then_approves';
  drop_folder: string;
};

export function prepareSunoJob(pkg: SunoPackage, dropFolder: string): SunoAdapterResult {
  return {
    mode: 'manual',
    package: pkg,
    next: 'human_listens_then_approves',
    drop_folder: dropFolder,
  };
}
