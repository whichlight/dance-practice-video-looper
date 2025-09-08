
import React, { useRef, useCallback, useEffect, useState } from 'react';

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  loopStart: number;
  loopEnd: number;
  setLoopStart: (time: number) => void;
  setLoopEnd: (time: number) => void;
  isLooping: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ 
  currentTime, 
  duration, 
  onSeek,
  loopStart,
  loopEnd,
  setLoopStart,
  setLoopEnd,
  isLooping
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);

  const getSeekTime = (e: MouseEvent | React.MouseEvent) => {
    if (!timelineRef.current || duration === 0) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    return percentage * duration;
  };
  
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const time = getSeekTime(e);
    onSeek(time);
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingPlayhead) {
      const time = getSeekTime(e);
      onSeek(time);
    } else if (isDraggingStart) {
      const time = getSeekTime(e);
      if (time < loopEnd) setLoopStart(time);
    } else if (isDraggingEnd) {
      const time = getSeekTime(e);
      if (time > loopStart) setLoopEnd(time);
    }
  }, [isDraggingPlayhead, isDraggingStart, isDraggingEnd, duration, loopStart, loopEnd, onSeek, setLoopStart, setLoopEnd]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingPlayhead(false);
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
  }, []);

  useEffect(() => {
    if (isDraggingPlayhead || isDraggingStart || isDraggingEnd) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, isDraggingStart, isDraggingEnd, handleMouseMove, handleMouseUp]);
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const loopStartPercentage = duration > 0 ? (loopStart / duration) * 100 : 0;
  const loopEndPercentage = duration > 0 ? (loopEnd / duration) * 100 : 0;

  return (
    <div 
      ref={timelineRef}
      className="relative w-full h-2 bg-gray-600 rounded-full cursor-pointer group"
      style={{ height: '8px' }}
      onClick={handleTimelineClick}
    >
      {/* Loop Region */}
      {isLooping && (
        <div 
          className="absolute h-full bg-emerald-500/30 rounded-full"
          style={{
            left: `${loopStartPercentage}%`,
            width: `${loopEndPercentage - loopStartPercentage}%`
          }}
        />
      )}

      {/* Progress Bar */}
      <div 
        className="absolute h-full bg-emerald-400 rounded-full"
        style={{ width: `${progressPercentage}%` }}
      />
      
      {/* Playhead */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-800"
        style={{ left: `${progressPercentage}%` }}
        onMouseDown={(e) => { e.stopPropagation(); setIsDraggingPlayhead(true); }}
      />
      
      {/* Loop Start Handle */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-5 bg-green-400 rounded-sm cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `${loopStartPercentage}%` }}
        onMouseDown={(e) => { e.stopPropagation(); setIsDraggingStart(true); }}
      />
      
      {/* Loop End Handle */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-5 bg-red-400 rounded-sm cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `${loopEndPercentage}%` }}
        onMouseDown={(e) => { e.stopPropagation(); setIsDraggingEnd(true); }}
      />
    </div>
  );
};

export default Timeline;
