import { unzipSync, strFromU8 } from 'fflate'

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
          // Find the first animation JSON — prefer animations/ folder, skip manifest.json
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
          resolve(data)
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
