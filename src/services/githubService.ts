import {
  CreateIssueRequest,
  CreatePullRequestRequest,
  GitHubComment,
  GitHubFilters,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRepository,
  GitHubReview,
  GitHubStats
} from '../types';

class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Repository methods
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  async getRepositories(username: string): Promise<GitHubRepository[]> {
    return this.request<GitHubRepository[]>(`/users/${username}/repos`);
  }

  // Issues methods
  async getIssues(owner: string, repo: string, filters?: GitHubFilters): Promise<GitHubIssue[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const url = `/repos/${owner}/${repo}/issues${queryString ? `?${queryString}` : ''}`;
    return this.request<GitHubIssue[]>(url);
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  async createIssue(owner: string, repo: string, issueData: CreateIssueRequest): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async updateIssue(owner: string, repo: string, issueNumber: number, updates: Partial<CreateIssueRequest>): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async closeIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.updateIssue(owner, repo, issueNumber, { state: 'closed' });
  }

  async reopenIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.updateIssue(owner, repo, issueNumber, { state: 'open' });
  }

  async getIssueComments(owner: string, repo: string, issueNumber: number): Promise<GitHubComment[]> {
    return this.request<GitHubComment[]>(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`);
  }

  async addIssueComment(owner: string, repo: string, issueNumber: number, body: string): Promise<GitHubComment> {
    return this.request<GitHubComment>(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  // Pull Requests methods
  async getPullRequests(owner: string, repo: string, filters?: GitHubFilters): Promise<GitHubPullRequest[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const url = `/repos/${owner}/${repo}/pulls${queryString ? `?${queryString}` : ''}`;
    return this.request<GitHubPullRequest[]>(url);
  }

  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<GitHubPullRequest> {
    return this.request<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  }

  async createPullRequest(owner: string, repo: string, prData: CreatePullRequestRequest): Promise<GitHubPullRequest> {
    return this.request<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify(prData),
    });
  }

  async updatePullRequest(owner: string, repo: string, prNumber: number, updates: Partial<CreatePullRequestRequest>): Promise<GitHubPullRequest> {
    return this.request<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${prNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async closePullRequest(owner: string, repo: string, prNumber: number): Promise<GitHubPullRequest> {
    return this.updatePullRequest(owner, repo, prNumber, { state: 'closed' });
  }

  async reopenPullRequest(owner: string, repo: string, prNumber: number): Promise<GitHubPullRequest> {
    return this.updatePullRequest(owner, repo, prNumber, { state: 'open' });
  }

  async mergePullRequest(owner: string, repo: string, prNumber: number, commitMessage?: string): Promise<any> {
    const body: any = {};
    if (commitMessage) {
      body.commit_message = commitMessage;
    }

    return this.request(`/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async getPullRequestComments(owner: string, repo: string, prNumber: number): Promise<GitHubComment[]> {
    return this.request<GitHubComment[]>(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`);
  }

  async getPullRequestReviews(owner: string, repo: string, prNumber: number): Promise<GitHubReview[]> {
    return this.request<GitHubReview[]>(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`);
  }

  async addPullRequestComment(owner: string, repo: string, prNumber: number, body: string): Promise<GitHubComment> {
    return this.request<GitHubComment>(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  // Stats methods
  async getRepositoryStats(owner: string, repo: string): Promise<GitHubStats> {
    const [issues, prs] = await Promise.all([
      this.getIssues(owner, repo, { state: 'all' }),
      this.getPullRequests(owner, repo, { state: 'all' })
    ]);

    const openIssues = issues.filter(issue => issue.state === 'open');
    const closedIssues = issues.filter(issue => issue.state === 'closed');
    const openPRs = prs.filter(pr => pr.state === 'open');
    const mergedPRs = prs.filter(pr => pr.state === 'merged');
    const closedPRs = prs.filter(pr => pr.state === 'closed');

    // Calculate average time to close
    const closedItems = [...closedIssues, ...closedPRs];
    const totalTimeToClose = closedItems.reduce((total, item) => {
      const created = new Date(item.created_at).getTime();
      const closed = new Date(item.closed_at!).getTime();
      return total + (closed - created);
    }, 0);
    const averageTimeToClose = closedItems.length > 0 ? totalTimeToClose / closedItems.length : 0;

    // Get top contributors
    const contributors = new Map<string, { user: any; contributions: number }>();
    [...issues, ...prs].forEach(item => {
      const login = item.user.login;
      const existing = contributors.get(login);
      if (existing) {
        existing.contributions++;
      } else {
        contributors.set(login, { user: item.user, contributions: 1 });
      }
    });

    const topContributors = Array.from(contributors.values())
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 5);

    return {
      totalIssues: issues.length,
      openIssues: openIssues.length,
      closedIssues: closedIssues.length,
      totalPRs: prs.length,
      openPRs: openPRs.length,
      mergedPRs: mergedPRs.length,
      closedPRs: closedPRs.length,
      averageTimeToClose,
      topContributors,
    };
  }

  // Search methods
  async searchIssues(query: string, filters?: GitHubFilters): Promise<{ items: GitHubIssue[]; total_count: number }> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return this.request<{ items: GitHubIssue[]; total_count: number }>(`/search/issues?${params.toString()}`);
  }

  async searchPullRequests(query: string, filters?: GitHubFilters): Promise<{ items: GitHubPullRequest[]; total_count: number }> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return this.request<{ items: GitHubPullRequest[]; total_count: number }>(`/search/issues?${params.toString()}&type=pr`);
  }
}

export const githubService = new GitHubService();
export default githubService; 