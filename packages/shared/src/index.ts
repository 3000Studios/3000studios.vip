export type Site = {
  id: string;
  name: string;
  url: string;
  environment: string;
  platform: string;
  tags: string;
  expected_status: number | null;
  expected_title: string | null;
  expected_canonical: string | null;
  expected_redirects: string;
  critical_routes: string;
  deploy_hook_url: string | null;
  workspace_key: string | null;
  workspace_path: string | null;
  bridge_origin: string | null;
  cloudflare_zone_id: string | null;
  cloudflare_zone_name: string | null;
  bridge_enabled: number;
  edit_surfaces: string;
  enabled: number;
  created_at: string;
  updated_at: string;
};

export type BridgeSnapshot = {
  site_id: string | null;
  origin: string;
  inspected_at: string;
  config_json: string;
  endpoint_status_json: string;
  selector_status_json: string;
  page_status: number | null;
  asset_url: string | null;
  error: string | null;
};

export type ZoneSummary = {
  id: string;
  name: string;
  status: string;
  name_servers: string[];
};
