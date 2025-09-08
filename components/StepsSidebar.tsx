import React, { useState, useEffect, useRef } from 'react';
import { Step } from './VideoPlayer';
import { formatTime } from '../utils/formatTime';
import { PlayIcon, DeleteIcon, AddIcon } from './icons';

interface StepsSidebarProps {
  steps: Step[];
  activeStepId: string | null;
  onAddStep: () => void;
  onPlayStep: (step: Step) => void;
  onDeleteStep: (id: string) => void;
  onUpdateStepName: (id: string, name: string) => void;
  onSave: () => void;
  onLoadSteps: (steps: Omit<Step, 'id'>[]) => void;
}

const StepItem: React.FC<{
  step: Step;
  isActive: boolean;
  onPlay: () => void;
  onDelete: () => void;
  onUpdateName: (name: string) => void;
}> = ({ step, isActive, onPlay, onDelete, onUpdateName }) => {
  const [name, setName] = useState(step.name);

  useEffect(() => {
    setName(step.name);
  }, [step.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    if (name.trim() === '') {
      setName(step.name); // revert if empty
    } else {
      onUpdateName(name);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }

  return (
    <div className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${isActive ? 'bg-emerald-900/50' : 'bg-gray-700/50'}`}>
      <button 
        onClick={onPlay} 
        title={`Play step: ${step.name}`}
        className="p-2 rounded-full bg-emerald-500/80 hover:bg-emerald-500 text-white transition-colors flex-shrink-0"
      >
        <PlayIcon className="w-5 h-5" />
      </button>
      <div className="flex-grow">
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-white font-semibold outline-none focus:bg-gray-600/50 rounded px-2 py-1 -ml-2"
          aria-label={`Step name for ${step.name}`}
        />
        <div className="text-xs text-gray-400 font-mono mt-1">
          {formatTime(step.start)} - {formatTime(step.end)}
        </div>
      </div>
      <button 
        onClick={onDelete} 
        title={`Delete step: ${step.name}`}
        className="p-2 rounded-full text-gray-400 hover:bg-red-500/30 hover:text-red-300 transition-colors flex-shrink-0"
      >
        <DeleteIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

const StepsSidebar: React.FC<StepsSidebarProps> = ({
  steps,
  activeStepId,
  onAddStep,
  onPlayStep,
  onDeleteStep,
  onUpdateStepName,
  onSave,
  onLoadSteps,
}) => {
  const loadInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const inputElement = event.target; // Persist the element for async access
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const data = JSON.parse(text);
          // Basic validation
          if (Array.isArray(data) && data.every(item => 'name' in item && 'start' in item && 'end' in item)) {
            onLoadSteps(data);
          } else {
            alert('Invalid steps file format.');
          }
        }
      } catch (error) {
        console.error("Failed to parse steps file", error);
        alert('Failed to read or parse the steps file.');
      } finally {
        // BUG FIX: Reset input value inside the callback to allow re-uploading the same file
        if (inputElement) {
            inputElement.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-gray-800 rounded-lg shadow-2xl p-4 flex flex-col">
      <h2 className="text-xl font-bold text-emerald-400 mb-4">Practice Steps</h2>
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={onAddStep}
          className="flex-grow flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md bg-emerald-500 hover:bg-emerald-600 transition-colors text-white"
        >
          <AddIcon className="w-5 h-5" /> Add Step
        </button>
        <button 
          onClick={() => loadInputRef.current?.click()}
          title="Load steps from JSON"
          className="px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Load
        </button>
        <input
          type="file"
          ref={loadInputRef}
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button 
          onClick={onSave}
          title="Save steps as JSON"
          className="px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Save
        </button>
      </div>
      <div className="flex-grow overflow-y-auto space-y-2 pr-1 -mr-2">
        {steps.length === 0 ? (
           <div className="text-center text-gray-500 pt-10">
            <p>No practice steps yet.</p>
            <p className="text-sm mt-1">Define a loop with "Set Start" & "Set End", then click "Add Step".</p>
          </div>
        ) : (
          steps.map(step => (
            <StepItem
              key={step.id}
              step={step}
              isActive={step.id === activeStepId}
              onPlay={() => onPlayStep(step)}
              onDelete={() => onDeleteStep(step.id)}
              onUpdateName={(name) => onUpdateStepName(step.id, name)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StepsSidebar;