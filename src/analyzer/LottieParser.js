/**
 * LottieParser — walks a Lottie JSON structure and records which features are present.
 *
 * Returns a findings map:
 *   { FEATURE_ID: { count: number, locations: string[] } }
 *
 * Locations are human-readable strings like "Main comp > Layer 3 (ind:3)"
 * or "Asset comp0 > Layer 7 (ind:7) > Shape group > gs"
 */

function addFinding(findings, featureId, location) {
  if (!findings[featureId]) {
    findings[featureId] = { count: 0, locations: [] }
  }
  findings[featureId].count++
  if (findings[featureId].locations.length < 3) {
    findings[featureId].locations.push(location)
  }
}

function layerLabel(layer, compName) {
  const name = layer.nm ? `"${layer.nm}"` : `ind:${layer.ind}`
  return `${compName} › Layer ${name}`
}

function walkShapes(shapes, layerLabel, findings) {
  if (!Array.isArray(shapes)) return

  for (const shape of shapes) {
    // Gradient stroke
    if (shape.ty === 'gs') {
      addFinding(findings, 'GRADIENT_STROKE', `${layerLabel} › gradient stroke`)
    }

    // Merge paths
    if (shape.ty === 'mm') {
      addFinding(findings, 'MERGE_PATHS', `${layerLabel} › merge paths`)
    }

    // Gradient fill — check for animated radial
    if (shape.ty === 'gf') {
      const isRadial = shape.t === 2
      if (isRadial) {
        // Check if focal point (s) or end point (e) is animated
        const sAnimated = shape.s && Array.isArray(shape.s.k) && shape.s.k.some(k => typeof k === 'object' && k.t !== undefined)
        const eAnimated = shape.e && Array.isArray(shape.e.k) && shape.e.k.some(k => typeof k === 'object' && k.t !== undefined)
        if (sAnimated || eAnimated) {
          addFinding(findings, 'ANIMATED_RADIAL_GRADIENT', `${layerLabel} › animated radial gradient fill`)
        }
      }
    }

    // Recurse into groups
    if (shape.ty === 'gr' && Array.isArray(shape.it)) {
      walkShapes(shape.it, layerLabel, findings)
    }
  }
}

function walkEffects(effects, lbl, findings) {
  if (!Array.isArray(effects)) return

  for (const ef of effects) {
    // ty:29 = Gaussian Blur, mn may also identify it
    if (ef.ty === 29 || ef.mn === 'ADBE Gaussian Blur 2') {
      addFinding(findings, 'GAUSSIAN_BLUR', `${lbl} › gaussian blur effect`)
    }
    // ty:25 = Drop Shadow
    if (ef.ty === 25 || ef.mn === 'ADBE Drop Shadow') {
      addFinding(findings, 'DROP_SHADOW', `${lbl} › drop shadow effect`)
    }
  }
}

function walkLayers(layers, compName, findings) {
  if (!Array.isArray(layers)) return

  for (const layer of layers) {
    const lbl = layerLabel(layer, compName)

    // Track matte — source layer
    if (layer.td === 1) {
      addFinding(findings, 'TRACK_MATTE', `${lbl} › matte source (td:1)`)
    }
    // Track matte — target layer (also flag it for counting clarity)
    if (layer.tt != null && layer.tt !== 0) {
      addFinding(findings, 'TRACK_MATTE', `${lbl} › matte target (tt:${layer.tt})`)
    }

    // Non-normal blend mode
    if (layer.bm != null && layer.bm !== 0) {
      addFinding(findings, 'NON_NORMAL_BLEND', `${lbl} › blend mode bm:${layer.bm}`)
    }

    // Layer mask
    if (layer.hasMask || (Array.isArray(layer.masksProperties) && layer.masksProperties.length > 0)) {
      addFinding(findings, 'MASK', `${lbl} › mask`)
    }

    // Text layer
    if (layer.ty === 5) {
      addFinding(findings, 'TEXT_LAYER', `${lbl} › text layer`)
    }

    // Effects
    if (Array.isArray(layer.ef) && layer.ef.length > 0) {
      walkEffects(layer.ef, lbl, findings)
    }

    // Shapes (ty:4 = shape layer)
    if (layer.ty === 4 && Array.isArray(layer.shapes)) {
      walkShapes(layer.shapes, lbl, findings)
    }
  }
}

/**
 * @param {object} animationData — parsed Lottie JSON
 * @returns {{ [featureId: string]: { count: number, locations: string[] } }}
 */
export function parseLottie(animationData) {
  const findings = {}

  // 3D composition flag
  if (animationData.ddd === 1) {
    addFinding(findings, 'CAMERA_3D', 'Root composition (ddd:1)')
  }

  // Walk main comp layers
  walkLayers(animationData.layers, 'Main comp', findings)

  // Walk all asset precomps
  if (Array.isArray(animationData.assets)) {
    for (const asset of animationData.assets) {
      if (Array.isArray(asset.layers)) {
        const assetName = asset.nm ? `Asset "${asset.nm}"` : `Asset id:"${asset.id}"`

        // 3D inside asset
        if (asset.ddd === 1) {
          addFinding(findings, 'CAMERA_3D', `${assetName} (ddd:1)`)
        }

        walkLayers(asset.layers, assetName, findings)
      }
    }
  }

  return findings
}
