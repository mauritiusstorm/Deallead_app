export type AudioProcessingStatus = 'queued' | 'processing' | 'ready' | 'failed'

export interface AudioProcessingResult {
  status: AudioProcessingStatus
  durationSeconds?: number
  waveformPeaks?: number[]
}

/**
 * Abstraction point for future audio pipeline work (transcoding, waveform
 * generation, loudness normalization, multi-bitrate/HLS output). The MVP
 * implementation just validates and stores the original upload.
 */
export interface AudioProcessingProvider {
  process(storagePath: string): Promise<AudioProcessingResult>
}

export class PassthroughAudioProcessingProvider implements AudioProcessingProvider {
  async process(): Promise<AudioProcessingResult> {
    return { status: 'ready' }
  }
}
