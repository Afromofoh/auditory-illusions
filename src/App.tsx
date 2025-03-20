import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

// Illusion One Component
function IllusionOne() {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-2">Illusion One</h2>
      <p>Visualization for the first auditory illusion.</p>
      import React, { useState, useEffect, useRef } from 'react';

const DeutschOctaveIllusion = () => {
  const [playing, setPlaying] = useState(false);
  const [baseNote, setBaseNote] = useState('C4');
  const [viewMode, setViewMode] = useState('physical'); // 'physical' or 'perceived'
  const [speed, setSpeed] = useState(250); // Default 250ms interval
  const [volume, setVolume] = useState(0.5); // Default volume 0.5
  
  const audioContext = useRef(null);
  const leftOscillator = useRef(null);
  const rightOscillator = useRef(null);
  const leftGain = useRef(null);
  const rightGain = useRef(null);
  
  // Animation refs
  const animationFrameRef = useRef(null);
  const leftEarHighToneRef = useRef(null);
  const leftEarLowToneRef = useRef(null);
  const rightEarHighToneRef = useRef(null);
  const rightEarLowToneRef = useRef(null);
  const leftEarPerceivedHighRef = useRef(null);
  const leftEarPerceivedLowRef = useRef(null);
  const rightEarPerceivedHighRef = useRef(null);
  const rightEarPerceivedLowRef = useRef(null);
  
  // To track current step in the pattern
  const currentStep = useRef(0);
  const patternInterval = useRef(null);
  
  // Base note frequency mapping (Hz)
  const noteFrequencies = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'B4': 493.88
  };
  
  // Clean up any audio when component unmounts
  useEffect(() => {
    return () => {
      stopAudio();
      if (patternInterval.current) {
        clearInterval(patternInterval.current);
        patternInterval.current = null;
      }
    };
  }, []);
  
  // Effect to update visualization when viewMode changes
  useEffect(() => {
    updateVisualBasedOnViewMode();
  }, [viewMode]);
  
  // Helper to get higher octave frequency
  const getHigherOctave = (note) => {
    return noteFrequencies[note] * 2; // Doubling frequency = one octave higher
  };
  
  // Set up the audio context and oscillators
  const initAudio = () => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContext.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext.current = new AudioContext();
      }
      
      // Resume the audio context (needed for browsers that suspend it)
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
      
      // Create oscillators and gain nodes for left and right channels
      // Left channel setup
      leftOscillator.current = audioContext.current.createOscillator();
      leftOscillator.current.type = 'sine';
      leftGain.current = audioContext.current.createGain();
      leftGain.current.gain.value = 0; // Start silent
      
      // Create stereo panner for left
      const leftPanner = audioContext.current.createStereoPanner();
      leftPanner.pan.value = -1; // Full left
      
      // Connect left chain: oscillator -> gain -> panner -> destination
      leftOscillator.current.connect(leftGain.current);
      leftGain.current.connect(leftPanner);
      leftPanner.connect(audioContext.current.destination);
      
      // Right channel setup
      rightOscillator.current = audioContext.current.createOscillator();
      rightOscillator.current.type = 'sine';
      rightGain.current = audioContext.current.createGain();
      rightGain.current.gain.value = 0; // Start silent
      
      // Create stereo panner for right
      const rightPanner = audioContext.current.createStereoPanner();
      rightPanner.pan.value = 1; // Full right
      
      // Connect right chain: oscillator -> gain -> panner -> destination
      rightOscillator.current.connect(rightGain.current);
      rightGain.current.connect(rightPanner);
      rightPanner.connect(audioContext.current.destination);
      
      // Start the oscillators
      leftOscillator.current.start();
      rightOscillator.current.start();
      
      return true;
    } catch (error) {
      console.error("Error initializing audio:", error);
      return false;
    }
  };
  
  // Stop and clean up all audio
  const stopAudio = () => {
    try {
      // Stop oscillators if they exist
      if (leftOscillator.current) {
        leftOscillator.current.stop();
        leftOscillator.current.disconnect();
        leftOscillator.current = null;
      }
      
      if (rightOscillator.current) {
        rightOscillator.current.stop();
        rightOscillator.current.disconnect();
        rightOscillator.current = null;
      }
      
      // Clean up gain nodes
      if (leftGain.current) {
        leftGain.current.disconnect();
        leftGain.current = null;
      }
      
      if (rightGain.current) {
        rightGain.current.disconnect();
        rightGain.current = null;
      }
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  };
  
  // Reset the visualization
  const resetVisuals = () => {
    // Reset all visual elements for physical tones
    if (leftEarHighToneRef.current) leftEarHighToneRef.current.style.opacity = '0';
    if (leftEarLowToneRef.current) leftEarLowToneRef.current.style.opacity = '0';
    if (rightEarHighToneRef.current) rightEarHighToneRef.current.style.opacity = '0';
    if (rightEarLowToneRef.current) rightEarLowToneRef.current.style.opacity = '0';
    
    // Reset perceived visual elements
    updatePerceivedVisuals(false);
  };
  
  // Update perceived visual elements based on current view mode
  const updateVisualBasedOnViewMode = () => {
    if (viewMode === 'perceived') {
      updatePerceivedVisuals(true);
    } else {
      updatePerceivedVisuals(false);
    }
  };
  
  // Update perceived visualization
  const updatePerceivedVisuals = (show) => {
    const opacity = show ? '0' : '0'; // Start with everything hidden
    
    if (leftEarPerceivedHighRef.current) leftEarPerceivedHighRef.current.style.opacity = opacity;
    if (leftEarPerceivedLowRef.current) leftEarPerceivedLowRef.current.style.opacity = opacity;
    if (rightEarPerceivedHighRef.current) rightEarPerceivedHighRef.current.style.opacity = opacity;
    if (rightEarPerceivedLowRef.current) rightEarPerceivedLowRef.current.style.opacity = opacity;
  };
  
  // Set the frequency and amplitude for an oscillator
  const setOscillatorTone = (oscillator, gainNode, frequency, active) => {
    if (!oscillator || !gainNode) return;
    
    // Set the frequency
    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    
    // Set the gain (volume)
    gainNode.gain.setValueAtTime(active ? volume : 0, audioContext.current.currentTime);
  };
  
  // Update visual representation for a specific step in the pattern
  const updateVisualForStep = (step) => {
    // Reset all tone visualizations
    if (leftEarHighToneRef.current) leftEarHighToneRef.current.style.opacity = '0';
    if (leftEarLowToneRef.current) leftEarLowToneRef.current.style.opacity = '0';
    if (rightEarHighToneRef.current) rightEarHighToneRef.current.style.opacity = '0';
    if (rightEarLowToneRef.current) rightEarLowToneRef.current.style.opacity = '0';
    
    // Reset perceived visualizations
    if (leftEarPerceivedHighRef.current) leftEarPerceivedHighRef.current.style.opacity = '0';
    if (leftEarPerceivedLowRef.current) leftEarPerceivedLowRef.current.style.opacity = '0';
    if (rightEarPerceivedHighRef.current) rightEarPerceivedHighRef.current.style.opacity = '0';
    if (rightEarPerceivedLowRef.current) rightEarPerceivedLowRef.current.style.opacity = '0';
    
    // Get pattern based on step
    const lowFreq = noteFrequencies[baseNote];
    const highFreq = getHigherOctave(baseNote);
    
    // Define the pattern
    const pattern = [
      { leftFreq: highFreq, rightFreq: lowFreq },
      { leftFreq: lowFreq, rightFreq: highFreq },
      { leftFreq: highFreq, rightFreq: lowFreq },
      { leftFreq: lowFreq, rightFreq: highFreq }
    ];
    
    const currentEvent = pattern[step % pattern.length];
    
    // Update based on view mode
    if (viewMode === 'physical') {
      // Update left ear visualization
      if (currentEvent.leftFreq === highFreq) {
        if (leftEarHighToneRef.current) leftEarHighToneRef.current.style.opacity = '1';
      } else {
        if (leftEarLowToneRef.current) leftEarLowToneRef.current.style.opacity = '1';
      }
      
      // Update right ear visualization
      if (currentEvent.rightFreq === highFreq) {
        if (rightEarHighToneRef.current) rightEarHighToneRef.current.style.opacity = '1';
      } else {
        if (rightEarLowToneRef.current) rightEarLowToneRef.current.style.opacity = '1';
      }
    } else {
      // Perceived mode - alternating pattern for illusion
      if (step % 2 === 0) {
        // Even steps: show high tone in left ear only
        if (leftEarPerceivedHighRef.current) leftEarPerceivedHighRef.current.style.opacity = '0.7';
        if (rightEarPerceivedLowRef.current) rightEarPerceivedLowRef.current.style.opacity = '0';
      } else {
        // Odd steps: show low tone in right ear only
        if (leftEarPerceivedHighRef.current) leftEarPerceivedHighRef.current.style.opacity = '0';
        if (rightEarPerceivedLowRef.current) rightEarPerceivedLowRef.current.style.opacity = '0.7';
      }
    }
    
    // Update audio
    setOscillatorTone(leftOscillator.current, leftGain.current, currentEvent.leftFreq, true);
    setOscillatorTone(rightOscillator.current, rightGain.current, currentEvent.rightFreq, true);
  };
  
  // Toggle illusion playback
  const toggleIllusion = () => {
    if (playing) {
      // Stop playback
      if (patternInterval.current) {
        clearInterval(patternInterval.current);
        patternInterval.current = null;
      }
      
      stopAudio();
      setPlaying(false);
      resetVisuals();
    } else {
      // Start playback
      setPlaying(true);
      resetVisuals();
      
      // Initialize audio
      const success = initAudio();
      if (!success) {
        setPlaying(false);
        return;
      }
      
      // Reset step counter
      currentStep.current = 0;
      
      // Initial update
      updateVisualForStep(currentStep.current);
      
      // Set up interval for continuous playback (using speed state)
      patternInterval.current = setInterval(() => {
        currentStep.current = (currentStep.current + 1) % 4;
        updateVisualForStep(currentStep.current);
      }, speed);
    }
  };
  
  // Format note name for display
  const formatNoteName = (note, isHigh = false) => {
    if (isHigh) {
      return note.replace('4', '5');
    }
    return note;
  };
  
  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dr. Deutsch's Octave Illusion</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                <label htmlFor="baseNote" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Base Frequency:
                </label>
                <select
                  id="baseNote"
                  value={baseNote}
                  onChange={(e) => setBaseNote(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={playing}
                >
                  <option value="C4">C4 (261.63 Hz)</option>
                  <option value="D4">D4 (293.66 Hz)</option>
                  <option value="E4">E4 (329.63 Hz)</option>
                  <option value="F4">F4 (349.23 Hz)</option>
                  <option value="G4">G4 (392.00 Hz)</option>
                  <option value="A4">A4 (440.00 Hz)</option>
                  <option value="B4">B4 (493.88 Hz)</option>
                </select>
              </div>
              
              <div className="ml-6">
                <button
                  onClick={toggleIllusion}
                  className={`px-6 py-2 rounded-md font-medium text-white transition-colors ${
                    playing ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  } shadow-sm`}
                >
                  {playing ? "Pause" : "Play Illusion"}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">View Mode:</span>
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'physical'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setViewMode('physical')}
                  >
                    Reality
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'perceived'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setViewMode('perceived')}
                  >
                    Perception
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Speed:</span>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="50"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  disabled={playing}
                  className="w-24"
                />
                <span className="text-xs text-gray-500">{speed}ms</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Volume:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-red-600 font-medium">
              Please use headphones for the best experience!
            </p>
          </div>
          
          <div className="relative bg-gray-100 rounded-lg p-6 mt-4">
            {/* Neural pathway visualization */}
            <div className="flex justify-center items-center h-64 relative">
              {/* Brain image matching ear style */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="w-40 h-40 relative">
                  <svg viewBox="0 0 160 140" width="160" height="140">
                    {/* Brain outline - more organic elongated oval shape */}
                    <g transform="translate(0,5)">
                      {/* Main brain outline - elongated oval, narrower at top, wider at bottom */}
                      <path
                        d="M80,10 
                        C100,10 118,15 130,25
                        C142,35 148,50 148,70
                        C148,90 142,105 130,115
                        C118,125 100,130 80,130
                        C60,130 42,125 30,115
                        C18,105 12,90 12,70
                        C12,50 18,35 30,25
                        C42,15 60,10 80,10Z"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                      />
                      
                      {/* Center dividing line - wavy longitudinal fissure */}
                      <path
                        d="M80,10 
                        C78,20 81,30 79,40 
                        C77,50 82,60 80,70 
                        C78,80 81,90 79,100 
                        C77,110 82,120 80,130"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                      />
                      
                      {/* Wavy irregular folds - Left Hemisphere - Frontal */}
                      <path d="M30,30 C35,25 40,28 45,24 C50,20 55,22 60,18" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M25,40 C30,36 36,39 42,35 C48,31 54,34 60,30" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M20,50 C27,47 35,51 42,48 C49,45 55,49 62,46" stroke="#6B7280" strokeWidth="1" fill="none" />
                      
                      {/* Wavy irregular folds - Left Hemisphere - Parietal & Temporal */}
                      <path d="M15,60 C22,57 27,62 34,59 C41,56 46,61 53,58" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M14,70 C21,67 28,72 35,69 C42,66 49,71 56,68" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M15,80 C24,78 30,84 39,82 C48,80 54,86 63,84" stroke="#6B7280" strokeWidth="1" fill="none" />
                      
                      {/* Wavy irregular folds - Left Hemisphere - Occipital */}
                      <path d="M20,90 C29,88 37,93 46,91 C55,89 63,94 72,92" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M28,100 C37,98 45,104 54,102 C63,100 71,106 80,104" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M35,110 C44,108 51,114 60,112 C69,110 76,116 85,114" stroke="#6B7280" strokeWidth="1" fill="none" />
                      
                      {/* Wavy irregular folds - Right Hemisphere - Frontal */}
                      <path d="M130,30 C125,25 120,28 115,24 C110,20 105,22 100,18" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M135,40 C130,36 124,39 118,35 C112,31 106,34 100,30" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M140,50 C133,47 125,51 118,48 C111,45 105,49 98,46" stroke="#6B7280" strokeWidth="1" fill="none" />
                      
                      {/* Wavy irregular folds - Right Hemisphere - Parietal & Temporal */}
                      <path d="M145,60 C138,57 133,62 126,59 C119,56 114,61 107,58" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M146,70 C139,67 132,72 125,69 C118,66 111,71 104,68" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M145,80 C136,78 130,84 121,82 C112,80 106,86 97,84" stroke="#6B7280" strokeWidth="1" fill="none" />
                      
                      {/* Wavy irregular folds - Right Hemisphere - Occipital */}
                      <path d="M140,90 C131,88 123,93 114,91 C105,89 97,94 88,92" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M132,100 C123,98 115,104 106,102 C97,100 89,106 80,104" stroke="#6B7280" strokeWidth="1" fill="none" />
                      <path d="M125,110 C116,108 109,114 100,112 C91,110 84,116 75,114" stroke="#6B7280" strokeWidth="1" fill="none" />
                      
                      {/* Additional wavy irregular folds - Left */}
                      <path d="M18,55 C25,53 31,57 38,55 C45,53 51,57 58,55" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M14,65 C22,63 29,67 37,65 C45,63 52,67 60,65" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M16,75 C24,73 31,77 39,75 C47,73 54,77 62,75" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M22,85 C31,83 39,87 48,85 C57,83 65,87 74,85" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M32,95 C41,93 49,97 58,95 C67,93 75,97 84,95" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M42,105 C51,103 59,107 68,105 C77,103 85,107 94,105" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      
                      {/* Additional wavy irregular folds - Right */}
                      <path d="M142,55 C135,53 129,57 122,55 C115,53 109,57 102,55" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M146,65 C138,63 131,67 123,65 C115,63 108,67 100,65" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M144,75 C136,73 129,77 121,75 C113,73 106,77 98,75" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M138,85 C129,83 121,87 112,85 C103,83 95,87 86,85" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M128,95 C119,93 111,97 102,95 C93,93 85,97 76,95" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      <path d="M118,105 C109,103 101,107 92,105 C83,103 75,107 66,105" stroke="#6B7280" strokeWidth="0.8" fill="none" />
                      
                      {/* Auditory cortex text - larger */}
                      <text x="80" y="60" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#4B5563">
                        Auditory Cortex
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
              
              {/* Ear visualizations with equal distance from center */}
              <div className="flex justify-between w-full px-8">
                {/* Left ear outline */}
                <div className="w-32 h-64 flex items-center justify-center">
                  <svg width="100" height="130" viewBox="0 0 100 130">
                    {/* Ear outline */}
                    <path
                      d="M80,65 C80,30 60,10 40,10 C20,10 10,30 10,50 C10,65 15,80 25,95 C35,110 60,120 70,115 C80,110 90,100 90,85 C90,75 85,70 80,65 Z"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="2"
                    />
                    {/* Inner ear details */}
                    <path
                      d="M70,65 C70,40 55,25 40,25 C25,25 20,40 20,50 C20,60 25,75 35,85 C45,95 60,100 65,95"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                    />
                    {/* Horizontal divider line */}
                    <line x1="10" y1="65" x2="90" y2="65" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="4 2"/>
                    {/* Label */}
                    <text x="50" y="125" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#4B5563">
                      Left Ear
                    </text>
                    
                    {/* High tone area (physical) */}
                    <rect
                      ref={leftEarHighToneRef}
                      x="20"
                      y="20"
                      width="60"
                      height="45"
                      rx="5"
                      fill="#e53e3e"
                      opacity="0"
                    />
                    
                    {/* Low tone area (physical) */}
                    <rect
                      ref={leftEarLowToneRef}
                      x="20"
                      y="65"
                      width="60"
                      height="45"
                      rx="5"
                      fill="#3182ce"
                      opacity="0"
                    />
                    
                    {/* High tone area (perceived) */}
                    <rect
                      ref={leftEarPerceivedHighRef}
                      x="20"
                      y="20"
                      width="60"
                      height="45"
                      rx="5"
                      fill="#9f7aea"
                      opacity="0"
                    />
                    
                    {/* Low tone area (perceived) */}
                    <rect
                      ref={leftEarPerceivedLowRef}
                      x="20"
                      y="65"
                      width="60"
                      height="45"
                      rx="5"
                      fill="#9f7aea"
                      opacity="0"
                    />
                  </svg>
                </div>
                
                {/* Right ear outline */}
                <div className="w-32 h-64 flex items-center justify-center">
                  <svg width="100" height="130" viewBox="0 0 100 130">
                    {/* Ear outline - mirrored from left ear */}
                    <path
                      d="M20,65 C20,30 40,10 60,10 C80,10 90,30 90,50 C90,65 85,80 75,95 C65,110 40,120 30,115 C20,110 10,100 10,85 C10,75 15,70 20,65 Z"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="2"
                    />
                    {/* Inner ear details */}
                    <path
                      d="M30,65 C30,40 45,25 60,25 C75,25 80,40 80,50 C80,60 75,75 65,85 C55,95 40,100 35,95"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                    />
                    {/* Horizontal divider line */}
                    <line x1="10" y1="65" x2="90" y2="65" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="4 2"/>
                    {/* Label */}
                    <text x="50" y="125" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#4B5563">
                      Right Ear
                    </text>
                    
                    {/* High tone area (physical) */}
                    <rect
                      ref={rightEarHighToneRef}
                      x="20"
                      y="20"
                      width="60"
                      height="45"
                      rx="5"
                      fill="#e53e3e"
                      opacity="0"
                    />
                    
                    {/* Low tone area (physical) */}
                    <rect
                      ref={rightEarLowToneRef}
                      x="20"
                      y="65"
                      width="60"
                      height="45"
                      rx="5"
                      fill="#3182ce"
                      opacity="0"
                    />
                    
                    {/* High tone area (perceived) */}
                    <rect
                      ref={rightEarPerceivedHighRef}
                      x="20"
                      y="20"
                      width="60"
                      height="45"
                      rx="5"
                      fill="#9f7aea"
                      opacity="0"
                    />
                    
                    {/* Low tone area (perceived) */}
                    <rect
                      ref={rightEarPerceivedLowRef}
                      x="20"
                      y="65"
                      width="60"
                      height="45"
                      rx="5"
                      fill="#9f7aea"
                      opacity="0"
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-8">
              {viewMode === 'perceived' ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm">Perceived Tone</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">High Tone ({formatNoteName(baseNote, true)})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Low Tone ({baseNote})</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        

      </div>
    </div>
  );
};

export default DeutschOctaveIllusion;
    </div>
  );
}

// Illusion Two Component
function IllusionTwo() {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-2">Illusion Two</h2>
      <p>Visualization for the second auditory illusion.</p>
      import React, { useState, useEffect, useRef } from 'react';

const ScaleIllusionVisualization = () => {
  const [rootNote, setRootNote] = useState('C4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('physical'); // 'physical' or 'perceived'
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [volume, setVolume] = useState(0.5);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioContextRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Define all notes
  const allNotes = [
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'
  ];
  
  // Define note frequencies
  const noteFrequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
    'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.26, 'F5': 698.46,
    'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
  };
  
  // Generate scale illusion data based on root note
  const generateScaleIllusion = (root) => {
    const rootIndex = allNotes.indexOf(root);
    if (rootIndex === -1) return null;
    
    // Major scale intervals: whole, whole, half, whole, whole, whole, half
    const scaleIntervals = [0, 2, 4, 5, 7, 9, 11, 12];
    
    // Generate the major scale notes
    const scale = scaleIntervals.map(interval => allNotes[rootIndex + interval]);
    
    // Physical pattern - corrected as specified
    // Left ear:  C4, B4, E4, G4 (sustained), E4, B4, C4  (for C major)
    // Right ear: C5, D4, A4, F4 (sustained), A4, D4, C5  (for C major)
    
    // Map this to scale degrees:
    // Left ear:  1, 7, 3, 5 (sustained), 3, 7, 1
    // Right ear: 8, 2, 6, 4 (sustained), 6, 2, 8
    
    const leftEar = [
      scale[0], // 1st degree (root)
      scale[6], // 7th degree
      scale[2], // 3rd degree
      scale[4], // 5th degree (sustained)
      null,     // This position is null because the previous note is sustained
      scale[2], // 3rd degree
      scale[6], // 7th degree
      scale[0]  // 1st degree (root)
    ];
    
    const rightEar = [
      scale[7], // 8th degree (octave)
      scale[1], // 2nd degree
      scale[5], // 6th degree
      scale[3], // 4th degree (sustained)
      null,     // This position is null because the previous note is sustained
      scale[5], // 6th degree
      scale[1], // 2nd degree
      scale[7]  // 8th degree (octave)
    ];
    
    // Construct the time points for the physical pattern
    const physicalPattern = [];
    for (let i = 0; i < leftEar.length; i++) {
      physicalPattern.push({
        leftEar: leftEar[i],
        rightEar: rightEar[i]
      });
    }
    
    // For the perceived pattern for visualization (not for audio)
    // Ascending scale in left ear: C4, D4, E4, F4, E4, D4, C4
    // Descending scale in right ear: C5, B4, A4, G4, A4, B4, C5
    
    const leftPerceived = [
      scale[0], // Root (C4)
      scale[1], // 2nd (D4)
      scale[2], // 3rd (E4)
      scale[3], // 4th (F4) - sustained
      scale[2], // 3rd (E4) - next note after half note
      scale[1], // 2nd (D4)
      scale[0]  // Root (C4)
    ];
    
    const rightPerceived = [
      scale[7], // Octave (C5)
      scale[6], // 7th (B4)
      scale[5], // 6th (A4)
      scale[4], // 5th (G4) - sustained
      scale[5], // 6th (A4) - next note after half note
      scale[6], // 7th (B4)
      scale[7]  // Octave (C5)
    ];
    
    // Construct perceived pattern for visualization
    const perceivedPattern = [];
    for (let i = 0; i < leftPerceived.length; i++) {
      perceivedPattern.push({
        leftEar: leftPerceived[i],
        rightEar: rightPerceived[i]
      });
    }
    
    return {
      physical: physicalPattern,
      perceived: perceivedPattern,
      scale,
      leftEar,
      rightEar,
      leftPerceived,
      rightPerceived
    };
  };
  
  const scaleIllusion = generateScaleIllusion(rootNote);
  
  // Helper function to play a note with stereo panning
  const playNote = (note, pan, duration = 0.5) => {
    if (!note || !audioContextRef.current) return;
    
    const frequency = noteFrequencies[note];
    if (!frequency) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    const panNode = audioContextRef.current.createStereoPanner();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
    
    panNode.pan.setValueAtTime(pan, audioContextRef.current.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(audioContextRef.current.destination);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
    
    return { oscillator, gainNode, panNode };
  };
  
  // Play both left and right ear notes at the current index
  const playCurrentNotes = (index) => {
    if (!scaleIllusion) return;
    
    // We always play the actual physical pattern, regardless of view mode
    if (index < scaleIllusion.physical.length) {
      const timePoint = scaleIllusion.physical[index];
      
      // Play right ear note
      if (timePoint.rightEar) {
        // If we're at index 3 (the sustained note), play it for twice as long
        const duration = index === 3 ? 1.0 : 0.5;
        playNote(timePoint.rightEar, 1, duration); // Pan right
      }
      
      // Play left ear note
      if (timePoint.leftEar) {
        // If we're at index 3 (the sustained note), play it for twice as long
        const duration = index === 3 ? 1.0 : 0.5;
        playNote(timePoint.leftEar, -1, duration); // Pan left
      }
    }
  };
  
  // Start playing the scale illusion
  const startPlaying = () => {
    if (isPlaying) return;
    
    // Initialize AudioContext if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    setIsPlaying(true);
    setCurrentNoteIndex(0);
  };
  
  // Stop playing
  const stopPlaying = () => {
    setIsPlaying(false);
    setCurrentNoteIndex(-1);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  
  // Handle note changes and scheduling
  useEffect(() => {
    if (!isPlaying || currentNoteIndex === -1 || !scaleIllusion) return;
    
    // Play current notes
    playCurrentNotes(currentNoteIndex);
    
    // Get the maximum length for the current view mode
    // We always use physical.length because the perceived view is just a visualization change,
    // the actual audio sequence is the same
    const maxLength = scaleIllusion.physical.length;
    
    // Schedule next note or stop if we're at the end
    if (currentNoteIndex < maxLength - 1) {
      // Skip the null position (which represents the sustained note's second beat)
      const nextIndex = currentNoteIndex === 3 ? 5 : currentNoteIndex + 1;
      
      // For the sustained note (index 3), we need to wait longer
      const interval = currentNoteIndex === 3 ? 1000 / playbackSpeed : 500 / playbackSpeed;
      
      timeoutRef.current = setTimeout(() => {
        setCurrentNoteIndex(nextIndex);
      }, interval);
    } else {
      // End of sequence - loop back to beginning
      timeoutRef.current = setTimeout(() => {
        setCurrentNoteIndex(0);
      }, 500 / playbackSpeed);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentNoteIndex, playbackSpeed, viewMode, scaleIllusion]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Helper function to check if a key is currently active
  const isKeyActive = (side, noteToCheck) => {
    if (currentNoteIndex === -1 || !scaleIllusion) return false;
    
    if (viewMode === 'physical') {
      // In Reality mode, check against the actual physical pattern
      const timePoint = scaleIllusion.physical[currentNoteIndex];
      return side === 'left' 
        ? timePoint.leftEar === noteToCheck
        : timePoint.rightEar === noteToCheck;
    } else {
      // In Perception mode, show ascending and descending scales in separate ears
      
      // Generate the major scale for the current root note
      const rootIndex = allNotes.indexOf(rootNote);
      const scaleIntervals = [0, 2, 4, 5, 7, 9, 11, 12]; // Major scale intervals
      const scale = scaleIntervals.map(interval => allNotes[rootIndex + interval]);
      
      // Get the adjusted index for perception mode
      const adjustedIndex = getActiveNoteIndex();
      
      if (side === 'left') {
        // Left ear - ascending scale: root, +2, +2, +1, +2, etc.
        // C4, D4, E4, F4, E4, D4, C4 (for C major)
        const leftScale = [
          scale[0], // Root (C4)
          scale[1], // 2nd (D4)
          scale[2], // 3rd (E4)
          scale[3], // 4th (F4) - sustained
          scale[2], // 3rd (E4)
          scale[1], // 2nd (D4)
          scale[0]  // Root (C4)
        ];
        
        if (adjustedIndex < 0 || adjustedIndex >= leftScale.length) return false;
        
        return leftScale[adjustedIndex] === noteToCheck;
      } else {
        // Right ear - descending scale: octave, -2, -2, -1, -2, etc.
        // C5, B4, A4, G4, A4, B4, C5 (for C major)
        const rightScale = [
          scale[7], // Octave (C5)
          scale[6], // 7th (B4)
          scale[5], // 6th (A4)
          scale[4], // 5th (G4) - sustained
          scale[5], // 6th (A4)
          scale[6], // 7th (B4)
          scale[7]  // Octave (C5)
        ];
        
        if (adjustedIndex < 0 || adjustedIndex >= rightScale.length) return false;
        
        return rightScale[adjustedIndex] === noteToCheck;
      }
    }
  };
  
  // Get the active note index for visualization
  const getActiveNoteIndex = () => {
    if (currentNoteIndex === -1) return -1;
    
    // Map the physical index to perceived index
    // For the half note (index 3 and 4 in physical pattern):
    // - Only highlight the half note during index 3
    // - For index 4, move to the next note in the sequence
    if (currentNoteIndex === 4) {
      return 4; // Move on to next note immediately after half note
    } else if (currentNoteIndex >= 5) {
      return currentNoteIndex - 1;
    }
    return currentNoteIndex;
  };
  
  // Calculate vertical position for notes on staff
  const getNotePosition = (note) => {
    // Middle C (C4) is our reference point
    const halfStepsFromC4 = allNotes.indexOf(note) - allNotes.indexOf('C4');
    
    // Each staff line/space represents 2 half steps
    // Higher notes have lower position values (closer to top of staff)
    return 60 - (halfStepsFromC4 * 3);
  };
  
  // Render piano keys
  const renderPianoKeys = () => {
    if (!scaleIllusion) return null;
    
    // Get the root index and generate a range of keys that covers the full scale
    const rootIndex = allNotes.indexOf(rootNote);
    // Extend the range to include one more key on the right to show the octave
    const keyRange = allNotes.slice(Math.max(0, rootIndex - 5), rootIndex + 13);
    
    return (
      <div className="flex h-24 justify-center">
        {keyRange.map((note, i) => {
          const isBlackKey = note.includes('#');
          const isLeftActive = isKeyActive('left', note);
          const isRightActive = isKeyActive('right', note);
          
          // Determine the key color based on which ear it's active for
          let keyColor = isBlackKey ? 'bg-black' : 'bg-white border border-gray-300';
          if (isLeftActive) keyColor = 'bg-blue-500';
          if (isRightActive) keyColor = 'bg-red-500';
          if (isLeftActive && isRightActive) keyColor = 'bg-purple-500'; // Both ears
          
          const classes = `
            ${isBlackKey ? 'h-16 w-6 -mx-3 z-10 relative' : 'h-24 w-8'} 
            ${keyColor} 
            flex items-end justify-center pb-1 text-xs
            ${isBlackKey && (isLeftActive || isRightActive) ? 'text-white' : ''}
          `;
          
          return (
            <div key={i} className={classes}>
              {!isBlackKey && note.includes('C') ? note : ''}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dr. Deutsch's Scale Illusion</h1>
      
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 w-full justify-center">
        <div>
          <label className="block text-sm font-medium mb-1">Root Note:</label>
          <select 
            value={rootNote} 
            onChange={(e) => setRootNote(e.target.value)}
            className="border rounded p-2"
            disabled={isPlaying}
          >
            {['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'].map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">View Mode:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-2 ${viewMode === 'physical' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('physical')}
            >
              Reality
            </button>
            <button 
              className={`px-3 py-2 ${viewMode === 'perceived' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('perceived')}
            >
              Perception
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Speed:</label>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Volume:</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={isPlaying ? stopPlaying : startPlaying}
          className={`px-6 py-2 rounded ${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white font-medium`}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
      </div>
      
      {/* Visualization */}
      <div className="w-full">
        {/* Brain and ear visualization */}
        <div className="relative flex justify-center mb-8">
          {/* Left ear */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-center">
            <div className="h-16 w-8 bg-blue-200 rounded-l-full flex items-center justify-center shadow-sm">
              <span className="text-blue-800 text-xs font-bold">L</span>
            </div>
            <div className="mt-2 text-sm font-medium text-blue-800">Left Ear</div>
          </div>
          
          {/* Brain */}
          <div className="w-64 h-48 bg-gray-200 rounded-full flex items-center justify-center relative">
            <div className="w-56 h-40 bg-pink-100 rounded-full flex items-center justify-center">
              {/* Left hemisphere - blue to match left ear */}
              <div className="absolute left-6 w-24 h-36 bg-blue-200 rounded-l-full"></div>
              {/* Right hemisphere - red to match right ear */}
              <div className="absolute right-6 w-24 h-36 bg-red-200 rounded-r-full"></div>
              {/* Corpus callosum */}
              <div className="absolute w-20 h-4 bg-pink-300 rounded-full"></div>
            </div>
            
            {/* Add label for current mode - removed as requested */}
          </div>
          
          {/* Right ear */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-center">
            <div className="h-16 w-8 bg-red-200 rounded-r-full flex items-center justify-center shadow-sm">
              <span className="text-red-800 text-xs font-bold">R</span>
            </div>
            <div className="mt-2 text-sm font-medium text-red-800">Right Ear</div>
          </div>
        </div>
        
        {/* Piano visualization - single keyboard */}
        <div className="mt-6">
          <h3 className="text-center mb-2 font-medium">Keyboard Visualization</h3>
          <div className="flex justify-center">
            {renderPianoKeys()}
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-xs">Left Ear</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-xs">Right Ear</span>
            </div>
          </div>
        </div>
        
        {/* Sheet music display */}
        <div className="flex justify-center mb-4">
          <div className="relative w-full max-w-md p-3 rounded shadow-sm"></div>
        </div>
        
        {/* Notes sequence display - completely removed as requested */}
        
        {/* Information section removed as requested */}
      </div>
    </div>
  );
};

export default ScaleIllusionVisualization;
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-3xl font-bold mb-4">Auditory Illusions Visualizations</h1>
        <nav className="mb-4">
          <Link to="/illusion-one" className="mr-4 text-blue-500">Illusion One</Link>
          <Link to="/illusion-two" className="text-blue-500">Illusion Two</Link>
        </nav>
        <Routes>
          <Route path="/illusion-one" element={<IllusionOne />} />
          <Route path="/illusion-two" element={<IllusionTwo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
