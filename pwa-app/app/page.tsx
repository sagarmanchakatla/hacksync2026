// "use client";

// import React, { useState, useRef, useCallback } from "react";
// import {
//   Camera,
//   Settings,
//   Play,
//   Square,
//   Volume2,
//   VolumeX,
//   Loader2,
// } from "lucide-react";
// import CameraFeed, { CameraFeedHandle } from "@/components/camera-feed";
// import GeminiAssistant from "@/components/gemini-assistant";
// import FeedbackSystem, { FeedbackSystemHandle } from "@/components/feedback-system";
// import VoiceInput from "@/components/voice-input";

// export default function VisionAssistApp() {
//   const [isActive, setIsActive] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [status, setStatus] = useState("Ready to start");
//   const [aiResponse, setAiResponse] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [userPrompt, setUserPrompt] = useState<string | null>(null);
//   const [isListening, setIsListening] = useState(false);
  
//   const [apiKey, setApiKey] = useState(
//     "AIzaSyBemxFCKVsg6JQDnNY_g42s3Yn2cGouju4"
//   );
//   const [showSettings, setShowSettings] = useState(false);

//   const cameraRef = useRef<CameraFeedHandle>(null);
//   const feedbackRef = useRef<FeedbackSystemHandle>(null);

//   // Handle Voice Input
//   const handleVoiceInput = useCallback((text: string) => {
//     setUserPrompt(text);
//     setStatus(`Analyzing: "${text}"...`);
//   }, []);

//   // Handle AI Response
//   const handleAiResponse = useCallback((text: string) => {
//     setAiResponse(text);
//     setStatus("Response received");
//     feedbackRef.current?.speak(text);
//     setUserPrompt(null); // Reset prompt after handling
//   }, []);

//   const toggleActive = () => {
//     setIsActive(!isActive);
//     if (!isActive) {
//       setStatus("Listening & Watching...");
//       feedbackRef.current?.speak("System started. I am listening.");
//     } else {
//       setStatus("Stopped");
//       feedbackRef.current?.stop();
//       feedbackRef.current?.speak("System stopped.");
//       setUserPrompt(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
//       {/* Header */}
//       <div className="bg-gray-800 p-4 shadow-lg z-10">
//         <div className="flex items-center justify-between max-w-4xl mx-auto">
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <Camera className="w-8 h-8 text-blue-400" />
//             SENTINEL Live
//           </h1>
//           <button
//             onClick={() => setShowSettings(!showSettings)}
//             className="p-2 hover:bg-gray-700 rounded-lg transition"
//             aria-label="Settings"
//           >
//             <Settings className="w-6 h-6" />
//           </button>
//         </div>
//       </div>

//       {/* Settings Panel */}
//       {showSettings && (
//         <div className="bg-gray-800 p-4 border-b border-gray-700 z-20">
//           <div className="max-w-4xl mx-auto space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Gemini API Key
//               </label>
//               <input
//                 type="password"
//                 value={apiKey}
//                 onChange={(e) => setApiKey(e.target.value)}
//                 placeholder="Enter your Gemini API key"
//                 className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden max-w-md mx-auto w-full">
        
//         {/* Camera Viewport */}
//         <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl mb-6 ring-4 ring-gray-800">
//             <CameraFeed 
//                 ref={cameraRef} 
//                 isActive={isActive} 
//                 onStreamReady={() => setStatus("Monitoring")}
//             />
            
//             {/* Status Overlay */}
//             <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
//                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
//                     <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
//                     <span className="text-sm font-medium truncate max-w-[150px]">{status}</span>
//                 </div>
                
//                 <button
//                     onClick={() => setIsMuted(!isMuted)}
//                     className={`p-2 rounded-full backdrop-blur-md border border-white/10 ${
//                         isMuted ? 'bg-red-500/50 text-white' : 'bg-black/60 text-white'
//                     }`}
//                 >
//                     {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
//                 </button>
//             </div>

//             {/* Processing Indicator */}
//             {isProcessing && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
//                     <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
//                 </div>
//             )}
//         </div>

//         {/* AI Response Card */}
//         <div className="w-full mb-6 min-h-[120px]">
//             <div className={`bg-gray-800/80 border border-gray-700 p-6 rounded-2xl backdrop-blur-md transition-all duration-500 ${aiResponse ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
//                 <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
//                     {userPrompt ? `Q: ${userPrompt}` : "Live Analysis"}
//                 </h3>
//                 <p className="text-lg leading-relaxed text-gray-100">
//                     {aiResponse || (isActive ? "Listening for your questions..." : "Start system to begin.")}
//                 </p>
//             </div>
//         </div>

//         {/* Primary Controls */}
//         <div className="flex items-center gap-8 mb-8">
//              {/* Start/Stop Button */}
//             <button
//                 onClick={toggleActive}
//                 className={`p-6 rounded-full transition-all transform hover:scale-105 shadow-xl ${
//                     isActive 
//                     setIsListening={setIsListening}
//                 />
//             )}
//         </div>

//         {/* Logic Components */}
//         <GeminiAssistant 
//             apiKey={apiKey}
//             isActive={isActive}
//             userPrompt={userPrompt}
//             onResponse={handleAiResponse}
//             captureFrame={() => cameraRef.current?.captureFrame() || null}
//             onProcessingStart={() => setIsProcessing(true)}
//             onProcessingEnd={() => setIsProcessing(false)}
//         />
        
//         <FeedbackSystem 
//             ref={feedbackRef}
//             isMuted={isMuted}
//         />

//       </div>
//     </div>
//   );
// }


'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useGeminiLive } from './useGeminiLive';
import CameraFeed, { CameraFeedHandle } from "@/components/camera-feed";
import { Camera, Mic, MicOff, Power, Video } from "lucide-react";

export default function LivePage() {
  const { connect, disconnect, startRecording, isStreaming, sendVideoFrame } = useGeminiLive();
  const cameraRef = useRef<CameraFeedHandle>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-connect and start camera on mount (optional, or keep manual)
  // For now, let's keep it manual as per previous flow but cleaner

  useEffect(() => {
    if (isStreaming && isCameraActive) {
      // Send frames periodically
      intervalRef.current = setInterval(() => {
        const frame = cameraRef.current?.captureFrame();
        if (frame) {
          sendVideoFrame(frame);
        }
      }, 1000); // 1 FPS to avoid quota limits
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreaming, isCameraActive, sendVideoFrame]);

  const handleStart = async () => {
    connect();
    setIsCameraActive(true);
  };

  const handleStop = () => {
    disconnect();
    setIsCameraActive(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-400" />
                Gemini Live Vision
            </h1>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isStreaming ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                {isStreaming ? 'LIVE' : 'OFFLINE'}
            </div>
        </div>

        {/* Camera View */}
        <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <CameraFeed 
                ref={cameraRef}
                isActive={isCameraActive}
            />
            
            {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <Video className="w-12 h-12 opacity-20" />
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
            {!isStreaming ? (
                <button 
                    onClick={handleStart}
                    className="col-span-2 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                    <Power className="w-5 h-5" />
                    Start System
                </button>
            ) : (
                <>
                    <button 
                        onClick={startRecording}
                        className="py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border border-white/10"
                    >
                        <Mic className="w-5 h-5 text-green-400" />
                        Unmute Mic
                    </button>
                    <button 
                        onClick={handleStop}
                        className="py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border border-red-500/20"
                    >
                        <Power className="w-5 h-5" />
                        Disconnect
                    </button>
                </>
            )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 p-4 rounded-xl text-sm text-gray-400 border border-white/5">
            <p>1. Click <strong>Start System</strong> to connect.</p>
            <p>2. Click <strong>Unmute Mic</strong> to speak.</p>
            <p>3. Ask questions about what the camera sees.</p>
        </div>

      </div>
    </div>
  );
}
