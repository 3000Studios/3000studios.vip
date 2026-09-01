import { Agent, routeAgentRequest, callable, scheduleEvery } from "agents";
import type { Env } from "../shared/env";
import { extractTitle, extractCanonical, extractRobots } from "../shared/seo";

type SiteState = {
  id: string;
  name: string;
  url: string;
  adsenseClientId: string | null;
  adsenseEnabled: boolean;
  adsenseStatus: "live" | "issue" | "configured" | "missing";
  errors: string[];
  recommendations: string[];
  lastChecked: string;
};

type GlobalState = {
  sites: SiteState[];
  totalSites: number;
  sitesWithAdsense: number;
  sitesWithAdsenseIssues: number;
  lastAudit: string;
};

export class SiteAuditAgent extends Agent<Env, GlobalState> {
  initialState: GlobalState = {
    sites: [],
    totalSites: 0,
    sitesWithAdsense: 0,
    sitesWithAdsenseIssues: 0,
    lastAudit: new Date().toISOString(),
  };

  validateStateChange(nextState: GlobalState, source: Connection | "server") {
    if (nextState.sites.length > 1000) {
      throw new Error("Cannot track more than 1000 sites");
    }
  }

  onStateUpdate(state: GlobalState, source: Connection | "server") {
    console.log(`SiteAuditAgent state updated: ${state.totalSites} sites tracked`);
  }

  @callable()
  async startFullAudit() {
    console.log("Starting full site audit...");
    await this.auditAllSites();
    return { status: "audit_started", timestamp: new Date().toISOString() };
  }

  @callable()
  async checkAdsensePrerequisites(siteUrl: string) {
    const result = await this.checkSingleSiteAdsense(siteUrl);
    if (result.errors.length > 0) {
      await this.fixAdsenseErrors(siteUrl, result.errors);
    }
    return result;
  }

  @callable()
  async spawnSubAgentForSite(siteId: string) {
    const site = this.state.sites.find((s) => s.id === siteId);
    if (!site) {
      throw new Error(`Site not found: ${siteId}`);
    }

    const subAgent = new SiteSubAgent(this.env, site);
    await subAgent.initialize();
    return { subAgentId: siteId, status: "initialized" };
  }

  @callable()
  async deployAllSites() {
    const sitesToDeploy = this.state.sites.filter((s) => s.adsenseStatus === "live");
    const results = [];

    for (const site of sitesToDeploy) {
      try {
        const deployResult = await this.deploySite(site.id);
        results.push({ siteId: site.id, success: true, result: deployResult });
      } catch (error) {
        results.push({ siteId: site.id, success: false, error: String(error) });
      }
    }

    return { deployed: results.length, results };
  }

  private async auditAllSites() {
    const sites = await this.fetchAllSites();
    this.setState({ ...this.state, sites, totalSites: sites.length });

    for (const site of sites) {
      await this.checkSingleSite(site);
    }

    this.updateAdsenseStats();
  }

  private async fetchAllSites() {
    const response = await fetch(`${this.env.API_BASE_URL}/sites`);
    return response.json<{ sites: any[] }>().then((data) => data.sites);
  }

  private async checkSingleSite(site: any) {
    const siteState: SiteState = {
      id: site.id,
      name: site.name,
      url: site.url,
      adsenseClientId: site.adsense_client_id,
      adsenseEnabled: site.adsense_enabled === 1,
      adsenseStatus: "missing",
      errors: [],
      recommendations: [],
      lastChecked: new Date().toISOString(),
    };

    const adsenseResult = await this.checkSingleSiteAdsense(site.url);
    siteState.adsenseStatus = adsenseResult.status;
    siteState.errors = adsenseResult.errors;
    siteState.recommendations = adsenseResult.recommendations;

    this.setState({
      sites: [...this.state.sites.filter((s) => s.id !== site.id), siteState]
    });
  }

  private async checkSingleSiteAdsense(siteUrl: string) {
    const errors: string[] = [];
    const recommendations: string[] = [];

    try {
      const response = await fetch(siteUrl);
      const html = await response.text();

      const title = extractTitle(html);
      const canonical = extractCanonical(html);
      const robots = extractRobots(html);

      if (!title) errors.push("Missing title tag");
      if (!canonical) errors.push("Missing canonical link");
      if (robots?.toLowerCase().includes("noindex")) {
        errors.push("Site is noindexed");
      }

      if (!title) recommendations.push("Add a descriptive title tag");
      if (!canonical) recommendations.push("Add canonical link to prevent duplicate content");
      if (!robots?.toLowerCase().includes("index")) {
        recommendations.push("Allow indexing by adding 'index' to robots meta tag");
      }

      if (errors.length === 0) {
        return { status: "live" as const, errors, recommendations };
      }

      return { status: "issue" as const, errors, recommendations };
    } catch (error) {
      errors.push(`Failed to fetch site: ${error}`);
      return { status: "issue" as const, errors, recommendations: ["Check site accessibility"] };
    }
  }

  private async fixAdsenseErrors(siteUrl: string, errors: string[]) {
    for (const error of errors) {
      if (error.includes("Missing title tag")) {
        console.log(`Would add title tag to ${siteUrl}`);
      } else if (error.includes("Missing canonical link")) {
        console.log(`Would add canonical link to ${siteUrl}`);
      } else if (error.includes("Site is noindexed")) {
        console.log(`Would update robots meta tag to allow indexing for ${siteUrl}`);
      }
    }
  }

  private updateAdsenseStats() {
    const sitesWithAdsense = this.state.sites.filter((s) => s.adsenseEnabled);
    const sitesWithAdsenseIssues = this.state.sites.filter((s) => s.adsenseStatus === "issue");

    this.setState({
      sitesWithAdsense: sitesWithAdsense.length,
      sitesWithAdsenseIssues: sitesWithAdsenseIssues.length,
    });
  }

  private async deploySite(siteId: string) {
    const site = this.state.sites.find((s) => s.id === siteId);
    if (!site) throw new Error(`Site not found: ${siteId}`);

    const deployUrl = `${this.env.WORKER_URL}/sites/${siteId}/playbooks/deploy-hook`;
    const response = await fetch(deployUrl, { method: "POST" });
    return response.json();
  }
}

export class SiteSubAgent extends Agent<Env, SiteState> {
  initialState: SiteState;

  constructor(env: Env, site: SiteState) {
    super(env);
    this.initialState = site;
  }

  async initialize() {
    console.log(`SiteSubAgent initialized for site: ${this.state.name}`);
    await this.runSiteSpecificTasks();
  }

  @callable()
  async runSiteSpecificTasks() {
    const tasks = [
      { name: "checkAdsense", fn: () => this.checkAdsense() },
      { name: "validateSEO", fn: () => this.validateSEO() },
      { name: "runHealthChecks", fn: () => this.runHealthChecks() },
    ];

    const results = [];
    for (const task of tasks) {
      try {
        const result = await task.fn();
        results.push({ task: task.name, success: true, result });
      } catch (error) {
        results.push({ task: task.name, success: false, error: String(error) });
      }
    }

    return { siteId: this.state.id, results };
  }

  private async checkAdsense() {
    const adsenseUrl = `${this.state.url}/ads.txt`;
    const response = await fetch(adsenseUrl);
    const content = await response.text();

    if (content.includes("google.com")) {
      return { status: "configured", message: "Adsense configured correctly" };
    }

    return { status: "missing", message: "Adsense not configured" };
  }

  private async validateSEO() {
    const response = await fetch(this.state.url);
    const html = await response.text();

    const title = extractTitle(html);
    const canonical = extractCanonical(html);
    const robots = extractRobots(html);

    const issues = [];
    if (!title) issues.push("Missing title tag");
    if (!canonical) issues.push("Missing canonical link");
    if (robots?.toLowerCase().includes("noindex")) issues.push("Site is noindexed");

    return { issues, score: Math.max(0, 100 - issues.length * 20) };
  }

  private async runHealthChecks() {
    const healthUrl = `${this.env.API_BASE_URL}/sites/${this.state.id}/run`;
    const response = await fetch(healthUrl, { method: "POST" });
    return response.json();
  }
}
