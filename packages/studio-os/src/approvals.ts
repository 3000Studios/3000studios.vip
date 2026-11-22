const APPROVAL_TASKS = new Set([
  'distribution_submit',
  'paid_ads',
  'rights_change',
  'financial',
  'destructive_website',
  'delete_production_assets',
  'approval_gate',
  'publish',
]);

export function requiresApproval(taskId: string, requireApprovalConfig: boolean): boolean {
  if (!requireApprovalConfig) return false;
  return APPROVAL_TASKS.has(taskId);
}
