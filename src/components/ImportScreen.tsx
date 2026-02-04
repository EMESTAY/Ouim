import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { useDataStore } from '../stores/useDataStore';
import { Card } from './ui/Card';

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
    try {
      console.log('Reading file:', file.name, 'size:', file.size);
      const text = await file.text();
      console.log('File read successfully, length:', text.length);
      const success = await importData(text);
      if (success) {
        console.log('Import successful!');
      } else {
        console.warn('Import returned false, check store error.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error reading file:', err.message);
      } else {
        console.error('Error reading file:', err);
      }
      // erreur store maj
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 relative overflow-hidden">
      {/* ambiance fond */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gym-blue/20 rounded-full blur-[100px] opacity-20 animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gym-purple/20 rounded-full blur-[100px] opacity-20 animate-pulse pointer-events-none"
        style={{ animationDelay: '2s' }}
      />

      <Card className="max-w-md w-full space-y-8 p-8 border-white/10 shadow-2xl shadow-black/50 z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gym-blue to-gym-purple bg-clip-text text-transparent mb-2">
            Gym Tracker Online
          </h1>
          <p className="text-neutral-400">Manage your workout data from your browser.</p>
        </div>

        <div
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer group
            ${dragActive ? 'border-gym-blue bg-gym-blue/10 scale-105' : 'border-neutral-700 bg-black/20 hover:bg-black/40 hover:border-neutral-500'}
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
      </Card>
    </div>
  );
};
