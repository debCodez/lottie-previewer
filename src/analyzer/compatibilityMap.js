export const SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
}

export const COMPATIBILITY_MAP = {
  TRACK_MATTE: {
    id: 'TRACK_MATTE',
    name: 'Track Matte (tt / td)',
    severity: SEVERITY.CRITICAL,
    affectedRenderers: ['Web — Canvas', 'Flutter'],
    description:
      'Track matte layers use one layer to mask another. Canvas and Flutter Lottie runtimes do not support this compositing mode — the matte source is rendered but masking is skipped, causing shapes or text to appear unclipped or completely invisible.',
    fix: 'In After Effects, pre-compose the matte pair into a single layer, then export as a pre-baked flat composition. Alternatively, replace the matte with an alpha-channel mask directly on the target layer, or use a Shape Layer clip-path approach.',
  },

  GRADIENT_STROKE: {
    id: 'GRADIENT_STROKE',
    name: 'Gradient Stroke (gs)',
    severity: SEVERITY.CRITICAL,
    affectedRenderers: ['Web — Canvas', 'Flutter'],
    description:
      'Gradient strokes (a stroke with a gradient fill along its path) are not supported by canvas-based renderers or the Flutter Lottie library. The stroke will either render as a solid color or be skipped entirely.',
    fix: 'Replace gradient strokes with solid-color strokes. If the gradient effect is essential, convert the stroke to a filled shape path (Layer Styles → Flatten in AE) and apply a gradient fill instead.',
  },

  GAUSSIAN_BLUR: {
    id: 'GAUSSIAN_BLUR',
    name: 'Gaussian Blur Effect',
    severity: SEVERITY.CRITICAL,
    affectedRenderers: ['Web — Canvas', 'Flutter', 'iOS / Android'],
    description:
      'The ADBE Gaussian Blur 2 effect is not supported by any Lottie runtime. The blur will be completely ignored and the layer will render sharp, breaking any intentional soft-focus or glow design.',
    fix: 'Pre-render the blurred layer as a PNG image sequence or a single PNG and import it back as an image asset. For a static blur, rasterize the layer in Photoshop/AE and reference the PNG in Lottie.',
  },

  DROP_SHADOW: {
    id: 'DROP_SHADOW',
    name: 'Drop Shadow Effect',
    severity: SEVERITY.WARNING,
    affectedRenderers: ['Web — Canvas', 'Flutter'],
    description:
      'The Drop Shadow layer effect is only supported by the lottie-web SVG renderer. Canvas-based renderers and Flutter will silently skip it, causing elements to appear flat without their intended shadow.',
    fix: 'Pre-bake the drop shadow by flattening the layer with its shadow into a PNG, or recreate the shadow as a separate Shape Layer with a dark semi-transparent shape that\'s offset appropriately.',
  },

  NON_NORMAL_BLEND: {
    id: 'NON_NORMAL_BLEND',
    name: 'Non-Normal Blend Mode (bm)',
    severity: SEVERITY.WARNING,
    affectedRenderers: ['Web — Canvas', 'Flutter'],
    description:
      'Layer blend modes other than Normal (bm:0) — such as Multiply, Screen, Overlay, etc. — are supported by the SVG renderer but have inconsistent or no support in canvas-based and Flutter renderers.',
    fix: 'Pre-bake the blend mode result into the artwork. In After Effects, pre-compose the blended layers and render a flat PNG of the result. Import back as an image layer with Normal blend mode.',
  },

  ANIMATED_RADIAL_GRADIENT: {
    id: 'ANIMATED_RADIAL_GRADIENT',
    name: 'Animated Radial Gradient',
    severity: SEVERITY.WARNING,
    affectedRenderers: ['Flutter'],
    description:
      'Radial gradient fills with animated focal point or radius are not fully implemented in the Flutter Lottie library. The gradient may appear static, use incorrect center points, or render incorrectly during animation.',
    fix: 'Simplify animated radial gradients to linear gradients where possible. If a radial gradient is essential, keep it static (non-animated) or pre-render affected frames as a PNG sequence.',
  },

  MERGE_PATHS: {
    id: 'MERGE_PATHS',
    name: 'Merge Paths (mm)',
    severity: SEVERITY.WARNING,
    affectedRenderers: ['Web — Canvas', 'Flutter'],
    description:
      'The Merge Paths shape operator performs boolean path operations (Add, Subtract, Intersect) at runtime. This is not supported by the canvas renderer or Flutter — shapes render as individual un-merged paths.',
    fix: 'Expand the merge paths result in After Effects before export: use Layer → Create Shapes from Vector Layer or flatten via pre-compose + rasterize to export resolved shape paths without the mm operator.',
  },

  TEXT_LAYER: {
    id: 'TEXT_LAYER',
    name: 'Text Layer (ty:5)',
    severity: SEVERITY.WARNING,
    affectedRenderers: ['Flutter', 'iOS / Android'],
    description:
      'Text layers rely on the runtime having the exact same font loaded. On Flutter and native mobile, missing fonts cause text to fall back to a system font or render as tofu (empty boxes). Font metrics also differ between platforms, causing text to overflow or mis-align.',
    fix: 'Convert text to outlines in After Effects before exporting (Layer → Create Shapes from Text). This bakes the text as vector shape data, removing the font dependency entirely.',
  },

  MASK: {
    id: 'MASK',
    name: 'Layer Mask',
    severity: SEVERITY.WARNING,
    affectedRenderers: ['Web — Canvas'],
    description:
      'Animated masks using Subtract or Intersect modes have inconsistent support in the canvas renderer and may produce incorrect compositing results.',
    fix: 'Use Add mode masks only for cross-renderer compatibility. For complex mask shapes, pre-compose and flatten to a PNG, or bake the clip path into the shape layer before export.',
  },

  CAMERA_3D: {
    id: 'CAMERA_3D',
    name: '3D Layers / Camera (ddd)',
    severity: SEVERITY.CRITICAL,
    affectedRenderers: ['Web — Canvas', 'Flutter', 'iOS / Android'],
    description:
      '3D composition or layer transforms with Z-axis data, camera layers, or light layers are not supported by any Lottie runtime. 3D transforms are ignored and layers render flat in document order, causing incorrect z-ordering and missing perspective.',
    fix: 'Collapse all 3D to a 2D composition before exporting. Disable all 3D layer switches and remove Camera and Light layers entirely.',
  },
}
