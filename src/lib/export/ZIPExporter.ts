import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Layer } from '@/types'

interface LayerExportData {
  id: string
  name: string
  canvas: HTMLCanvasElement | OffscreenCanvas
}

/**
 * Exports layers as individual PNGs in a ZIP file
 */
export class ZIPExporter {
  /**
   * Export layers to ZIP file
   */
  static async exportLayers(
    layers: LayerExportData[],
    filename = 'layers.zip'
  ): Promise<void> {
    const zip = new JSZip()

    // Add each layer as a PNG
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i]
      const safeName = layer.name.replace(/[^a-zA-Z0-9-_]/g, '_')
      const layerFilename = `${String(i + 1).padStart(2, '0')}_${safeName}.png`

      const blob = await this.canvasToBlob(layer.canvas)
      if (blob) {
        zip.file(layerFilename, blob)
      }
    }

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, filename)
  }

  /**
   * Export layers with metadata JSON
   */
  static async exportLayersWithMetadata(
    layers: Layer[],
    layerCanvases: Map<string, HTMLCanvasElement | OffscreenCanvas>,
    documentName = 'project',
    documentWidth: number,
    documentHeight: number
  ): Promise<void> {
    const zip = new JSZip()

    // Create metadata
    const metadata = {
      name: documentName,
      width: documentWidth,
      height: documentHeight,
      exportedAt: new Date().toISOString(),
      layers: layers.map((layer, index) => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        visible: layer.visible,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        transform: layer.transform,
        filename: `layers/${String(index + 1).padStart(2, '0')}_${layer.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.png`,
      })),
    }

    // Add metadata JSON
    zip.file('metadata.json', JSON.stringify(metadata, null, 2))

    // Create layers folder
    const layersFolder = zip.folder('layers')
    if (!layersFolder) throw new Error('Failed to create layers folder')

    // Add each layer
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i]
      const canvas = layerCanvases.get(layer.id)
      if (!canvas) continue

      const safeName = layer.name.replace(/[^a-zA-Z0-9-_]/g, '_')
      const layerFilename = `${String(i + 1).padStart(2, '0')}_${safeName}.png`

      const blob = await this.canvasToBlob(canvas)
      if (blob) {
        layersFolder.file(layerFilename, blob)
      }
    }

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${documentName}.zip`)
  }

  private static canvasToBlob(
    canvas: HTMLCanvasElement | OffscreenCanvas
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (canvas instanceof HTMLCanvasElement) {
        canvas.toBlob(resolve, 'image/png')
      } else {
        // OffscreenCanvas
        canvas.convertToBlob({ type: 'image/png' }).then(resolve).catch(() => resolve(null))
      }
    })
  }
}
