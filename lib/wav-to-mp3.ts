import { Mp3Encoder } from "@breezystack/lamejs";

const MP3_BITRATE = 128;
const ENCODE_BLOCK = 1152;

function readFourCC(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

function isWavFile(file: File): boolean {
  return (
    file.type === "audio/wav" ||
    file.type === "audio/wave" ||
    file.type === "audio/x-wav" ||
    /\.wav$/i.test(file.name)
  );
}

function floatToInt16(sample: number): number {
  const clipped = Math.max(-1, Math.min(1, sample));
  return clipped < 0 ? Math.round(clipped * 0x8000) : Math.round(clipped * 0x7fff);
}

function pcmToInt16Channels(
  view: DataView,
  dataOffset: number,
  dataSize: number,
  channels: number,
  bitsPerSample: number,
  audioFormat: number,
): Int16Array[] {
  const usedChannels = Math.min(channels, 2);
  const bytesPerSample = Math.ceil(bitsPerSample / 8);
  const blockAlign = bytesPerSample * channels;
  const frameCount = Math.floor(dataSize / blockAlign);
  const planes = Array.from({ length: usedChannels }, () => new Int16Array(frameCount));

  for (let frame = 0; frame < frameCount; frame++) {
    const frameOffset = dataOffset + frame * blockAlign;
    for (let channel = 0; channel < usedChannels; channel++) {
      const sampleOffset = frameOffset + channel * bytesPerSample;
      let sample: number;
      if (audioFormat === 3 && bitsPerSample === 32) {
        sample = floatToInt16(view.getFloat32(sampleOffset, true));
      } else if (bitsPerSample === 8) {
        sample = (view.getUint8(sampleOffset) - 128) << 8;
      } else if (bitsPerSample === 16) {
        sample = view.getInt16(sampleOffset, true);
      } else if (bitsPerSample === 24) {
        const b0 = view.getUint8(sampleOffset);
        const b1 = view.getUint8(sampleOffset + 1);
        const b2 = view.getUint8(sampleOffset + 2);
        let value = b0 | (b1 << 8) | (b2 << 16);
        if (value & 0x800000) value |= 0xff000000;
        sample = value >> 8;
      } else if (bitsPerSample === 32) {
        sample = view.getInt32(sampleOffset, true) >> 16;
      } else {
        throw new Error(`Unsupported WAV bit depth: ${bitsPerSample}.`);
      }
      planes[channel]![frame] = sample;
    }
  }

  return planes;
}

function parseWav(buffer: ArrayBuffer): { channels: 1 | 2; sampleRate: number; planes: Int16Array[] } {
  const view = new DataView(buffer);
  if (view.byteLength < 12 || readFourCC(view, 0) !== "RIFF" || readFourCC(view, 8) !== "WAVE") {
    throw new Error("That file isn't a WAV.");
  }

  let offset = 12;
  let audioFormat = 0;
  let channels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let dataOffset = 0;
  let dataSize = 0;

  while (offset + 8 <= view.byteLength) {
    const id = readFourCC(view, offset);
    const size = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (start + size > view.byteLength) break;

    if (id === "fmt ") {
      audioFormat = view.getUint16(start, true);
      channels = view.getUint16(start + 2, true);
      sampleRate = view.getUint32(start + 4, true);
      bitsPerSample = view.getUint16(start + 14, true);
    } else if (id === "data") {
      dataOffset = start;
      dataSize = size;
    }

    offset = start + size + (size % 2);
  }

  if (!dataSize || !channels || !sampleRate || !bitsPerSample) {
    throw new Error("Couldn't read that WAV file.");
  }

  const format = audioFormat === 65534 ? 1 : audioFormat;
  if (format !== 1 && format !== 3) {
    throw new Error("That WAV isn't uncompressed PCM, so it can't be converted here.");
  }

  const planes = pcmToInt16Channels(view, dataOffset, dataSize, channels, bitsPerSample, format);
  return {
    channels: planes.length === 2 ? 2 : 1,
    sampleRate,
    planes,
  };
}

export async function convertWavToMp3IfNeeded(file: File): Promise<File> {
  if (!isWavFile(file)) return file;

  const { channels, sampleRate, planes } = parseWav(await file.arrayBuffer());
  const encoder = new Mp3Encoder(channels, sampleRate, MP3_BITRATE);
  const left = planes[0]!;
  const right = planes[1];
  const parts: BlobPart[] = [];

  for (let i = 0; i < left.length; i += ENCODE_BLOCK) {
    const end = Math.min(i + ENCODE_BLOCK, left.length);
    const encoded =
      channels === 2 && right
        ? encoder.encodeBuffer(left.subarray(i, end), right.subarray(i, end))
        : encoder.encodeBuffer(left.subarray(i, end));
    if (encoded.length > 0) parts.push(new Uint8Array(encoded));
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) parts.push(new Uint8Array(flushed));

  const name = file.name.replace(/\.wav$/i, "") + ".mp3";
  return new File(parts, name, { type: "audio/mpeg", lastModified: Date.now() });
}
