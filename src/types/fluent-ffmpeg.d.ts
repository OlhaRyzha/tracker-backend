declare module 'fluent-ffmpeg' {
  import { Readable } from 'stream';

  function ffmpeg(input?: string | Readable): any;
  namespace ffmpeg {
    function setFfmpegPath(path: string): void;
  }

  export = ffmpeg;
}
