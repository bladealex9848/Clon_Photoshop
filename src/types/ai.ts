export interface AIDecomposeRequest {
  imageBase64: string
  layerCount: number
  instructions?: string
  outputFormat?: 'webp' | 'png'
  outputQuality?: number
  goFast?: boolean
}

export interface AIDecomposeResponse {
  success: boolean
  layers?: AILayer[]
  error?: string
  processingTime?: number
}

export interface AILayer {
  name: string
  imageUrl: string
  imageBase64?: string
  order: number
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface AIState {
  layerCount: number
  instructions: string
  infiniteDecomposition: boolean
  isProcessing: boolean
  progress: number
  error: string | null
  lastResult: AIDecomposeResponse | null
}
