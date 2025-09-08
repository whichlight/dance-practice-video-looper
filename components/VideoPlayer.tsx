import React, { useState, useRef, useEffect, useCallback } from 'react';
import Timeline from './Timeline';
import StepsSidebar from './StepsSidebar';
import { PlayIcon, PauseIcon, LoopIcon, ResetIcon, SetStartIcon, SetEndIcon, UploadIcon } from './icons';
import { formatTime } from '../utils/formatTime';

export interface Step {
  id: string;
  name: string;
  start: number;
  end: number;
}

interface VideoPlayerProps {
  videoUrl: string;
  videoName: string;
  onNewVideo: () => void;
}

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, videoName, onNewVideo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // Video metadata loading and initial setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoopEnd(video.duration);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    // Reset state when video changes
    video.src = videoUrl;
    setLoopStart(0);
    setLoopEnd(0);
    setCurrentTime(0);
    setIsPlaying(false);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);
  
  // Time update and looping logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      if (isLooping && current >= loopEnd) {
        video.currentTime = loopStart;
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isLooping, loopStart, loopEnd]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync active step with loop points
  useEffect(() => {
    if (activeStepId) {
      setSteps(prevSteps => prevSteps.map(step => 
        step.id === activeStepId ? { ...step, start: loopStart, end: loopEnd } : step
      ));
    }
  }, [loopStart, loopEnd, activeStepId]);


  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.error);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleSpeedChange = useCallback((rate: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const handleSetLoopStart = () => {
    const time = videoRef.current?.currentTime ?? 0;
    if (time < loopEnd) {
      setLoopStart(time);
    }
  };

  const handleSetLoopEnd = () => {
    const time = videoRef.current?.currentTime ?? 0;
    if (time > loopStart) {
      setLoopEnd(time);
    }
  };

  const handleReset = () => {
    if (videoRef.current) {
        videoRef.current.currentTime = loopStart;
    }
  };
  
  // Step handlers
  const handleAddStep = () => {
    const newStep: Step = {
        id: new Date().toISOString(),
        name: `Step ${steps.length + 1}`,
        start: loopStart,
        end: loopEnd,
    };
    setSteps([...steps, newStep]);
  };

  const handlePlayStep = (step: Step) => {
    setActiveStepId(step.id);
    setLoopStart(step.start);
    setLoopEnd(step.end);
    setIsLooping(true);
    handleSeek(step.start);
    if (videoRef.current?.paused) {
        togglePlayPause();
    }
  };

  const handleDeleteStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
    if (activeStepId === id) {
        setActiveStepId(null);
        setIsLooping(false); // Optionally turn off looping
    }
  };

  const handleUpdateStepName = (id: string, name: string) => {
    setSteps(steps.map(step => step.id === id ? { ...step, name } : step));
  };
  
  const handleSaveSteps = () => {
    if (steps.length === 0) return;
    const dataStr = JSON.stringify(steps.map(({ id, ...rest }) => rest), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dance_steps.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleLoadSteps = (importedSteps: Omit<Step, 'id'>[]) => {
    const stepsWithIds = importedSteps.map((step, index) => ({
      ...step,
      id: new Date().toISOString() + `-${index}`,
    }));
    setSteps(stepsWithIds);
  };

  const loopDuration = isLooping ? loopEnd - loopStart : 0;
  
  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4">
      {/* Video Player & Controls */}
      <div className="flex-grow flex flex-col bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        <div className="relative aspect-video bg-black">
          <video ref={videoRef} className="w-full h-full" onClick={togglePlayPause} />
        </div>
        <div className="p-4 space-y-4">
            {/* Timeline */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-400">{formatTime(currentTime)}</span>
              <Timeline 
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                loopStart={loopStart}
                loopEnd={loopEnd}
                setLoopStart={setLoopStart}
                setLoopEnd={setLoopEnd}
                isLooping={isLooping}
              />
              <span className="text-xs font-mono text-gray-400">{formatTime(duration)}</span>
            </div>

            {/* Redesigned Controls */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              
              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <button onClick={togglePlayPause} className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                  {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </button>
                 <button onClick={handleReset} title="Reset to Loop Start" className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded-full transition-colors">
                    <ResetIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsLooping(!isLooping)} 
                  title="Toggle Loop"
                  className={`p-2 rounded-full transition-colors ${isLooping ? 'bg-emerald-500/80 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                >
                  <LoopIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Loop Settings */}
              <div className="flex items-center gap-2">
                  <button onClick={handleSetLoopStart} title="Set Loop Start" className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-green-300 hover:bg-green-500/20 transition-colors">
                      <SetStartIcon className="w-5 h-5" /> Set Start
                  </button>
                  <button onClick={handleSetLoopEnd} title="Set Loop End" className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-red-300 hover:bg-red-500/20 transition-colors">
                      <SetEndIcon className="w-5 h-5" /> Set End
                  </button>
                  <div className="text-center font-mono text-xs text-emerald-400 pl-2 border-l border-gray-600">
                    <div>LOOP</div>
                    <div>{formatTime(loopDuration)}</div>
                  </div>
              </div>

              {/* Speed Controls */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-400 mr-1">SPEED</span>
                 {SPEED_PRESETS.map(speed => (
                    <button 
                        key={speed} 
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-2 py-1 text-sm rounded-md transition-colors w-10 ${playbackRate === speed ? 'bg-emerald-500 text-white' : 'hover:bg-gray-600'}`}
                    >
                        {speed}x
                    </button>
                ))}
              </div>
            </div>

            {/* Video Info & New Video */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-400 truncate pr-4">Now practicing: <span className="font-semibold text-gray-300">{videoName}</span></p>
                <button onClick={onNewVideo} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
                    <UploadIcon className="w-4 h-4" /> New Video
                </button>
            </div>
        </div>
      </div>

      {/* Steps Sidebar */}
      <StepsSidebar 
        steps={steps}
        activeStepId={activeStepId}
        onAddStep={handleAddStep}
        onPlayStep={handlePlayStep}
        onDeleteStep={handleDeleteStep}
        onUpdateStepName={handleUpdateStepName}
        onSave={handleSaveSteps}
        onLoadSteps={handleLoadSteps}
      />
    </div>
  );
};

export default VideoPlayer;