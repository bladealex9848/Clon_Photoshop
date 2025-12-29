import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Layer, Document, ViewState } from '@/types'

interface ProjectData {
  version: string
  document: Document
  layers: Layer[]
  layerOrder: string[]
  viewState: Partial<ViewState>
}

/**
 * Exports and imports project files in a custom JSON format
 */
export class ProjectExporter {
  private static readonly VERSION = '1.0.0'
  private static readonly FILE_EXTENSION = '.photoclone'

  /**
   * Export project to custom format (JSON + layer images in ZIP)
   */
  static async exportProject(
    document: Document,
    layers: Layer[],
    layerOrder: string[],
    layerCanvases: Map<string, HTMLCanvasElement | OffscreenCanvas>,
    viewState?: Partial<ViewState>
  ): Promise<void> {
    const zip = new JSZip()

    // Create project data
    const projectData: ProjectData = {
      version: this.VERSION,
      document,
      layers: layers.map((layer) => ({
        ...layer,
        imageData: undefined, // Don't include raw imageData, use PNG files
      })),
      layerOrder,
      viewState: viewState || {},
    }

    // Add project JSON
    zip.file('project.json', JSON.stringify(projectData, null, 2))

    // Create layers folder and add layer images
    const layersFolder = zip.folder('layers')
    if (layersFolder) {
      for (const layer of layers) {
        const canvas = layerCanvases.get(layer.id)
        if (!canvas) continue

        const blob = await this.canvasToBlob(canvas)
        if (blob) {
          layersFolder.file(`${layer.id}.png`, blob)
        }
      }
    }

    // Generate and download
    const content = await zip.generateAsync({ type: 'blob' })
    const filename = `${document.name}${this.FILE_EXTENSION}`
    saveAs(content, filename)
  }

  /**
   * Export project as JSON only (without images, for lightweight saves)
   */
  static exportProjectJSON(
    document: Document,
    layers: Layer[],
    layerOrder: string[],
    viewState?: Partial<ViewState>
  ): string {
    const projectData: ProjectData = {
      version: this.VERSION,
      document,
      layers: layers.map((layer) => ({
        ...layer,
        imageData: undefined,
      })),
      layerOrder,
      viewState: viewState || {},
    }

    return JSON.stringify(projectData, null, 2)
  }

  /**
   * Download project JSON
   */
  static downloadProjectJSON(
    document: Document,
    layers: Layer[],
    layerOrder: string[]
  ): void {
    const json = this.exportProjectJSON(document, layers, layerOrder)
    const blob = new Blob([json], { type: 'application/json' })
    const filename = `${document.name}.json`
    saveAs(blob, filename)
  }

  /**
   * Import project from ZIP file
   */
  static async importProject(
    file: File
  ): Promise<{ projectData: ProjectData; layerImages: Map<string, Blob> } | null> {
    try {
      const zip = await JSZip.loadAsync(file)

      // Read project.json
      const projectFile = zip.file('project.json')
      if (!projectFile) {
        throw new Error('Invalid project file: missing project.json')
      }

      const projectJson = await projectFile.async('string')
      const projectData: ProjectData = JSON.parse(projectJson)

      // Read layer images
      const layerImages = new Map<string, Blob>()
      const layersFolder = zip.folder('layers')

      if (layersFolder) {
        const files = layersFolder.file(/.+\.png$/)
        for (const file of files) {
          const layerId = file.name.replace('layers/', '').replace('.png', '')
          const blob = await file.async('blob')
          layerImages.set(layerId, blob)
        }
      }

      return { projectData, layerImages }
    } catch (error) {
      console.error('Failed to import project:', error)
      return null
    }
  }

  /**
   * Import project from JSON string
   */
  static importProjectJSON(json: string): ProjectData | null {
    try {
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  private static canvasToBlob(
    canvas: HTMLCanvasElement | OffscreenCanvas
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (canvas instanceof HTMLCanvasElement) {
        canvas.toBlob(resolve, 'image/png')
      } else {
        canvas.convertToBlob({ type: 'image/png' }).then(resolve).catch(() => resolve(null))
      }
    })
  }
}
