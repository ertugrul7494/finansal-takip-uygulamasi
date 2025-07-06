import React, { useEffect, useState } from 'react';
import githubService from '../services/githubService';
import {
  CreateIssueRequest,
  GitHubFilters,
  GitHubIssue,
  GitHubRepository,
  formatDate
} from '../types';
import './GitHubIssues.css';

interface GitHubIssuesProps {
  owner: string;
  repo: string;
  token?: string;
}

const GitHubIssues: React.FC<GitHubIssuesProps> = ({ owner, repo, token }) => {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<GitHubFilters>({ state: 'open' });
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [newIssue, setNewIssue] = useState<CreateIssueRequest>({
    title: '',
    body: '',
    labels: [],
    assignees: []
  });

  useEffect(() => {
    if (token) {
      githubService.setToken(token);
    }
    loadData();
  }, [owner, repo, token, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [issuesData, repoData] = await Promise.all([
        githubService.getIssues(owner, repo, filters),
        githubService.getRepository(owner, repo)
      ]);

      setIssues(issuesData);
      setRepository(repoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    try {
      const createdIssue = await githubService.createIssue(owner, repo, newIssue);
      setIssues(prev => [createdIssue, ...prev]);
      setShowCreateForm(false);
      setNewIssue({ title: '', body: '', labels: [], assignees: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    }
  };

  const handleCloseIssue = async (issueNumber: number) => {
    try {
      const updatedIssue = await githubService.closeIssue(owner, repo, issueNumber);
      setIssues(prev => prev.map(issue =>
        issue.number === issueNumber ? updatedIssue : issue
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close issue');
    }
  };

  const handleReopenIssue = async (issueNumber: number) => {
    try {
      const updatedIssue = await githubService.reopenIssue(owner, repo, issueNumber);
      setIssues(prev => prev.map(issue =>
        issue.number === issueNumber ? updatedIssue : issue
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reopen issue');
    }
  };

  const getStateColor = (state: string) => {
    return state === 'open' ? '#28a745' : '#cb2431';
  };

  const getStateIcon = (state: string) => {
    return state === 'open' ? '🔴' : '✅';
  };

  if (loading) {
    return (
      <div className="github-issues">
        <div className="loading">Loading issues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="github-issues">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="github-issues">
      <div className="github-header">
        <div className="repo-info">
          {repository && (
            <>
              <h2>{repository.full_name}</h2>
              <p>{repository.description}</p>
              <div className="repo-stats">
                <span>⭐ {repository.stargazers_count}</span>
                <span>🍴 {repository.forks_count}</span>
                <span>🐛 {repository.open_issues_count} open issues</span>
              </div>
            </>
          )}
        </div>

        <div className="github-actions">
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            New Issue
          </button>
        </div>
      </div>

      <div className="filters">
        <select
          value={filters.state || 'all'}
          onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value as any }))}
        >
          <option value="all">All Issues</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.sort || 'created'}
          onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
        >
          <option value="created">Newest</option>
          <option value="updated">Recently Updated</option>
          <option value="comments">Most Commented</option>
        </select>
      </div>

      {showCreateForm && (
        <div className="create-issue-form">
          <h3>Create New Issue</h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={newIssue.title}
              onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Issue title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newIssue.body || ''}
              onChange={(e) => setNewIssue(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Issue description (optional)"
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Labels (comma-separated)</label>
            <input
              type="text"
              value={newIssue.labels?.join(', ') || ''}
              onChange={(e) => setNewIssue(prev => ({
                ...prev,
                labels: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
              }))}
              placeholder="bug, enhancement, documentation"
            />
          </div>

          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={handleCreateIssue}
              disabled={!newIssue.title.trim()}
            >
              Create Issue
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="issues-list">
        {issues.length === 0 ? (
          <div className="empty-state">
            <h3>No issues found</h3>
            <p>There are no issues matching your current filters.</p>
          </div>
        ) : (
          issues.map(issue => (
            <div key={issue.id} className="issue-item">
              <div className="issue-header">
                <div className="issue-title">
                  <span className="issue-icon">{getStateIcon(issue.state)}</span>
                  <h4 onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}>
                    {issue.title}
                  </h4>
                  <span className="issue-number">#{issue.number}</span>
                </div>

                <div className="issue-meta">
                  <span className="issue-state" style={{ color: getStateColor(issue.state) }}>
                    {issue.state}
                  </span>
                  <span className="issue-date">
                    {formatDate(issue.created_at)}
                  </span>
                </div>
              </div>

              {selectedIssue?.id === issue.id && (
                <div className="issue-details">
                  <div className="issue-body">
                    {issue.body ? (
                      <div className="markdown-content">{issue.body}</div>
                    ) : (
                      <p className="no-description">No description provided.</p>
                    )}
                  </div>

                  <div className="issue-labels">
                    {issue.labels.map(label => (
                      <span
                        key={label.id}
                        className="label"
                        style={{ backgroundColor: `#${label.color}` }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>

                  <div className="issue-assignees">
                    {issue.assignees.length > 0 && (
                      <>
                        <strong>Assigned to:</strong>
                        {issue.assignees.map(assignee => (
                          <span key={assignee.id} className="assignee">
                            <img src={assignee.avatar_url} alt={assignee.login} />
                            {assignee.login}
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="issue-actions">
                    {issue.state === 'open' ? (
                      <button
                        className="btn-secondary"
                        onClick={() => handleCloseIssue(issue.number)}
                      >
                        Close Issue
                      </button>
                    ) : (
                      <button
                        className="btn-secondary"
                        onClick={() => handleReopenIssue(issue.number)}
                      >
                        Reopen Issue
                      </button>
                    )}
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GitHubIssues; 