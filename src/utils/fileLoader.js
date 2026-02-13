export function readLottieFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'))
        return
      }
  
      const validTypes = ['application/json', '']
      const validExtensions = ['.json', '.lottie']
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  
      if (!validExtensions.includes(ext)) {
        reject(new Error('Invalid file type. Please upload a .json or .lottie file'))
        return
      }
  
      const reader = new FileReader()
  
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
  
          // Basic Lottie validation
          if (!data.v || !data.layers) {
            reject(new Error('This JSON is not a valid Lottie file'))
            return
          }
  
          resolve(data)
        } catch (err) {
          reject(new Error('Could not parse file. Make sure it is valid JSON'))
        }
      }
  
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
  