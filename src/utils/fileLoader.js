import { unzipSync, strFromU8 } from 'fflate'

const MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

function mimeFor(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return MIME[ext] || 'application/octet-stream'
}

function uint8ToBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

// Patch animation assets to use inline base64 data URLs from the zip
function inlineAssets(data, zip) {
  if (!Array.isArray(data.assets)) return data
  data.assets.forEach((asset) => {
    // Only image assets have a 'p' (path) field and 'u' (url/folder) field
    if (!asset.p || asset.e === 1) return  // already embedded or not an image
    // Build the zip key: the image lives at <u><p> inside the zip
    const folder = (asset.u || '').replace(/^\/|\/$/g, '')
    const zipKey = folder ? `${folder}/${asset.p}` : asset.p
    const bytes = zip[zipKey] || zip[asset.p]
    if (!bytes) return
    const mime = mimeFor(asset.p)
    asset.p = `data:${mime};base64,${uint8ToBase64(bytes)}`
    asset.u = ''   // clear the folder prefix
    asset.e = 1    // mark as embedded so lottie-web doesn't try to fetch
  })
  return data
}

export function readLottieFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()

    if (ext === '.json') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (!data.v || !data.layers) {
            reject(new Error('This JSON is not a valid Lottie file'))
            return
          }
          resolve(data)
        } catch {
          reject(new Error('Could not parse file. Make sure it is valid JSON'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)

    } else if (ext === '.lottie') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const zip = unzipSync(new Uint8Array(e.target.result))
          const animKey =
            Object.keys(zip).find((k) => k.startsWith('animations/') && k.endsWith('.json')) ||
            Object.keys(zip).find((k) => k.endsWith('.json') && !k.includes('manifest'))
          const entry = zip[animKey]

          if (!entry) {
            reject(new Error('No animation JSON found inside .lottie file'))
            return
          }

          const data = JSON.parse(strFromU8(entry))
          if (!data.v || !data.layers) {
            reject(new Error('Animation data inside .lottie is not valid'))
            return
          }

          resolve(inlineAssets(data, zip))
        } catch {
          reject(new Error('Could not unzip .lottie file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)

    } else {
      reject(new Error('Invalid file type. Please upload a .json or .lottie file'))
    }
  })
}
