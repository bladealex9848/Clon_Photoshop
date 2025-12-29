/**
 * Exports canvas content as PNG
 */
export class PNGExporter {
  /**
   * Export canvas to PNG blob
   */
  static async toBlob(canvas: HTMLCanvasElement, quality = 1): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', quality)
    })
  }

  /**
   * Export canvas to PNG data URL
   */
  static toDataURL(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png')
  }

  /**
   * Download canvas as PNG file
   */
  static async download(canvas: HTMLCanvasElement, filename = 'image.png'): Promise<void> {
    const blob = await this.toBlob(canvas)
    if (!blob) throw new Error('Failed to create PNG blob')

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Export canvas to base64 string (without data URI prefix)
   */
  static toBase64(canvas: HTMLCanvasElement): string {
    const dataUrl = canvas.toDataURL('image/png')
    return dataUrl.split(',')[1]
  }
}
