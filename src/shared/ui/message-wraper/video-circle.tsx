import useDevicePixelRatio from '@/lib/hooks/sensors/useDevicePixelRatio';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { throttle } from '@/lib/utils/schedulers';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import VoiceButton from '../VoiceButton';
import MessageTimeSend from '../MessageTimeSend';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const VideoCircle = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  const dpr = useDevicePixelRatio();

  useEffect(() => {
    const video = videoRef.current;
    const timeDisplay = timeRef.current;

    if (video && timeDisplay) {
      const handleTimeUpdate = throttle(() => {
        const currentTime = video.currentTime;
        const duration = video.duration;

        timeDisplay.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
      }, 1000);

      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [dpr]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover .CirceControls': {
          opacity: 1,
          transform: 'translateX(0px) scale(1)',
        },
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        src="src/shared/assets/document_5357042721808730973.mp4"
        style={{ width: '100%', height: '100%' }}
      />
      <Typography
        ref={timeRef}
        level="body-xs"
        sx={{
          position: 'absolute',
          zIndex: 999,
          right: '0rem',
          top: '0rem',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          bgcolor: 'background.level3',
          p: '0.05rem 0.5rem',
          borderRadius: 'md',
        }}
      />
      <Typography
        level="body-xs"
        sx={{
          position: 'absolute',
          zIndex: 999,
          right: '0rem',
          bottom: '0rem',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          bgcolor: 'background.level3',
          p: '0.05rem',
          borderRadius: 'md',
        }}
      >
        <MessageTimeSend isSent unread startDecorator={<span>edited</span>} timestamp={'9:00'} />
      </Typography>

      <Box
        className="CirceControls"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          transition: 'transform 0.3s ease-in-out',
          transformOrigin: 'center right',
          transform: 'translateX(-100px) scale(0.25)',
        }}
      >
        <Box component={'button'} sx={{ width: '40px', height: '40px' }}>
          <VoiceButton />
        </Box>
      </Box>
    </Box>
  );
};

export default VideoCircle;
