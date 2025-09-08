
import React, { useState, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import { UploadIcon } from './components/icons';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoUrl(url);
    }
  }, []);

  const handleNewVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setVideoFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-7xl text-center mb-4">
        <h1 className="text-3xl font-bold text-emerald-400">Dance Practice Video Looper</h1>
        <p className="text-gray-400 mt-1">Isolate moves, perfect timing, master your choreography.</p>
      </header>
      
      <main className="w-full max-w-7xl flex-grow flex flex-col">
        {videoUrl && videoFile ? (
          <VideoPlayer videoUrl={videoUrl} onNewVideo={handleNewVideo} videoName={videoFile.name} />
        ) : (
          <div className="w-full flex-grow flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-600">
            <div className="text-center">
              <UploadIcon className="w-16 h-16 mx-auto text-gray-500" />
              <p className="mt-4 text-lg font-semibold">Upload a video to begin your practice</p>
              <p className="text-sm text-gray-400">Supported formats: MP4, MOV, AVI, WebM</p>
              <label htmlFor="video-upload" className="mt-6 inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-200">
                Select Video File
              </label>
              <input 
                id="video-upload" 
                type="file" 
                accept="video/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
