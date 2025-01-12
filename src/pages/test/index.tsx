import { useEffect, useState } from 'react';
import './styles.scss';
import { marked, Tokens } from 'marked';
import DOMPurify from 'dompurify';

import MoonPhases from '@/shared/common/MoonPhases';
import VideoPlayer from '@/widgets/video-player/public/ui/VideoPlayer';
import SeekLine from '@/widgets/video-player/public/ui/SeekLine';
import MediaPlayer from '@/widgets/video-player/public/ui/MediaPlayer';

marked.use({
  breaks: true,
  gfm: true,
  pedantic: true,
  renderer: {
    blockquote(quote: Tokens.Blockquote) {
      return `<blockquote class="markdown-alert">${this.parser.parse(quote.tokens)}</blockquote>`;
    },
  },
});

const TestPage = () => {
  return (
    <div className="p-5">
      <MediaPlayer />
    </div>
  );
};

export default TestPage;
