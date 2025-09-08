
export const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return '00:00.00';
  }

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const centiseconds = Math.floor((timeInSeconds * 100) % 100);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedCentiseconds = String(centiseconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}.${formattedCentiseconds}`;
};
