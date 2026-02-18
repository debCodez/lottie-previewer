import { detectIssues } from '../analyzer/FeatureDetector.js'
import { SEVERITY } from '../analyzer/compatibilityMap.js'

export class WarningPanel {
  constructor(animationData) {
    this._issues = detectIssues(animationData)
    this._expanded = true
    this._el = null
  }

  render() {
    const issues = this._issues

    const panel = document.createElement('div')
    panel.className = 'wp-panel'

    if (issues.length === 0) {
      panel.innerHTML = `
        <div class="wp-header wp-header--clean">
          <span class="wp-header-icon">✓</span>
          <span class="wp-header-title">No compatibility issues detected</span>
        </div>
      `
      this._el = panel
      return panel
    }

    const criticalCount = issues.filter(i => i.severity === SEVERITY.CRITICAL).length
    const warningCount = issues.filter(i => i.severity === SEVERITY.WARNING).length

    const badges = [
      criticalCount > 0 ? `<span class="wp-badge wp-badge--critical">${criticalCount} Critical</span>` : '',
      warningCount > 0 ? `<span class="wp-badge wp-badge--warning">${warningCount} Warning${warningCount > 1 ? 's' : ''}</span>` : '',
    ].join('')

    panel.innerHTML = `
      <button class="wp-header wp-header--issues" aria-expanded="true">
        <span class="wp-header-icon">⚠</span>
        <span class="wp-header-title">Compatibility Issues</span>
        <span class="wp-badges">${badges}</span>
        <span class="wp-chevron">▲</span>
      </button>
      <div class="wp-body"></div>
    `

    const headerBtn = panel.querySelector('.wp-header--issues')
    const body = panel.querySelector('.wp-body')
    const chevron = panel.querySelector('.wp-chevron')

    // Build issue cards
    body.innerHTML = this._buildBody(issues)

    // Toggle expand / collapse
    headerBtn.addEventListener('click', () => {
      this._expanded = !this._expanded
      body.style.display = this._expanded ? 'block' : 'none'
      chevron.textContent = this._expanded ? '▲' : '▼'
      headerBtn.setAttribute('aria-expanded', String(this._expanded))
    })

    this._el = panel
    return panel
  }

  _buildBody(issues) {
    const criticals = issues.filter(i => i.severity === SEVERITY.CRITICAL)
    const warnings = issues.filter(i => i.severity === SEVERITY.WARNING)

    let html = ''

    if (criticals.length > 0) {
      html += `<div class="wp-section-label">Critical Issues</div>`
      html += criticals.map(i => this._buildCard(i)).join('')
    }

    if (warnings.length > 0) {
      html += `<div class="wp-section-label wp-section-label--warning">Warnings</div>`
      html += warnings.map(i => this._buildCard(i)).join('')
    }

    return html
  }

  _buildCard(issue) {
    const isCritical = issue.severity === SEVERITY.CRITICAL
    const icon = isCritical ? '✕' : '!'
    const rendererPills = issue.affectedRenderers
      .map(r => `<span class="wp-renderer-pill">${r}</span>`)
      .join('')

    const countLabel = issue.count > 1 ? `<span class="wp-count">${issue.count}×</span>` : ''

    const locationLines = issue.locations.length > 0
      ? `<div class="wp-locations">${issue.locations.map(l =>
          `<span class="wp-location">${escapeHtml(l)}</span>`
        ).join('')}${issue.count > issue.locations.length
          ? `<span class="wp-location wp-location--more">…and ${issue.count - issue.locations.length} more</span>`
          : ''}</div>`
      : ''

    return `
      <div class="wp-card wp-card--${issue.severity}">
        <div class="wp-card-top">
          <span class="wp-card-icon wp-card-icon--${issue.severity}">${icon}</span>
          <span class="wp-card-name">${escapeHtml(issue.name)}</span>
          ${countLabel}
          <span class="wp-renderer-pills">${rendererPills}</span>
        </div>
        ${locationLines}
        <p class="wp-card-desc">${escapeHtml(issue.description)}</p>
        <div class="wp-fix-box">
          <span class="wp-fix-label">Fix</span>
          <span class="wp-fix-text">${escapeHtml(issue.fix)}</span>
        </div>
      </div>
    `
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
