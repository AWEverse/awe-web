export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return `${hours < 0 ? formatNumber(hours) + ':' : ''}${formatNumber(minutes)}:${formatNumber(secs)}`;
};
