import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { useDataStore } from '../stores/useDataStore';

export const ImportScreen: React.FC = () => {
  const { importData, isLoading, error } = useDataStore();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    await importData(text);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Gym Tracker Online</h1>
          <p className="text-neutral-400">Manage your workout data from your browser.</p>
        </div>

        <div
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors cursor-pointer
            ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-800/80'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}>
          <input
            id="file-upload"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept=".json"
          />

          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-3 bg-neutral-700 rounded-full">
              <Upload className="w-8 h-8 text-neutral-300" />
            </div>
            <div>
              <p className="text-lg font-medium text-white">Import your data</p>
              <p className="text-sm text-neutral-400 mt-1">
                Drag and drop your{' '}
                <span className="font-mono text-blue-400">gym-tracker-data.json</span> here
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {isLoading && <p className="text-center text-neutral-400 animate-pulse">Processing...</p>}
      </div>
    </div>
  );
};
