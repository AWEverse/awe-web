export interface PlayerControls {
  // Player state and settings
  state: () => PlaybackState;
  volume: () => number;
  isMuted: () => boolean;
  playbackRate: () => number;

  // State setters
  setState: (state: PlaybackState, force?: boolean) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;

  // Event signals (callbacks)
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onChangeVolume: (volume: number) => void;
  onChangeMuting: (muting: boolean) => void;
  onChangeRate: (rate: number) => void;

  // Private buttons and controls (if required for additional interface logic)
  _onPlayClicked?: () => void;
  _onPauseClicked?: () => void;
  _onMuteClicked?: () => void;
  _onUpdateRate?: () => void;
  _onVolumeSliderValueChanged?: () => void;
}

export enum PlaybackState {
  PlayingState,
  PausedState,
  StoppedState
}

