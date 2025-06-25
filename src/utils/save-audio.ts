import fs from 'fs/promises'
import path from 'path'
import config from '../config'
// @ts-ignore
import ffmpeg from 'fluent-ffmpeg';

export const saveAudioFile = async (id: string, filename: string, buffer: Buffer) => {
  const ext = path.extname(filename)
  const tempPath = path.join(config.storage.uploadsDir, `${id}-temp${ext}`)
  const outputName = `${id}.mp3`
  const outputPath = path.join(config.storage.uploadsDir, outputName)
  await fs.mkdir(config.storage.uploadsDir, { recursive: true })
  await fs.writeFile(tempPath, buffer)
  await new Promise<void>((resolve, reject) => {
    ffmpeg(tempPath)
      .audioBitrate(128)
      .toFormat('mp3')
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', (err: unknown) => reject(err))
  })
  await fs.unlink(tempPath)
  return outputName
}
