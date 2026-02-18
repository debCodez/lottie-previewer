import { parseLottie } from './LottieParser.js'
import { COMPATIBILITY_MAP, SEVERITY } from './compatibilityMap.js'

/**
 * Runs the parser and merges findings with the compatibility map.
 *
 * @param {object} animationData — parsed Lottie JSON
 * @returns {Array<{
 *   id: string,
 *   name: string,
 *   severity: string,
 *   affectedRenderers: string[],
 *   description: string,
 *   fix: string,
 *   count: number,
 *   locations: string[]
 * }>}  issues sorted critical-first, then by count descending
 */
export function detectIssues(animationData) {
  const findings = parseLottie(animationData)

  const issues = []

  for (const [featureId, finding] of Object.entries(findings)) {
    const def = COMPATIBILITY_MAP[featureId]
    if (!def) continue // unknown feature, skip

    issues.push({
      ...def,
      count: finding.count,
      locations: finding.locations,
    })
  }

  // Sort: critical first, then by occurrence count descending
  issues.sort((a, b) => {
    if (a.severity === b.severity) return b.count - a.count
    return a.severity === SEVERITY.CRITICAL ? -1 : 1
  })

  return issues
}
