"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

// Add type definitions for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

declare var window: IWindow;
declare var SpeechRecognition: any;
declare var webkitSpeechRecognition: any;

interface VoiceInputProps {
  onInput: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export default function VoiceInput({
  onInput,
  isListening,
  setIsListening,
}: VoiceInputProps) {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one sentence for Q&A
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice Input:", transcript);
        onInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'no-speech') {
            // Just stop listening, don't alert
        } else {
            console.error("Speech Error:", event.error);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
        console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [onInput, setIsListening]);

  useEffect(() => {
    if (isListening) {
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
    }
  }, [isListening]);

  return (
    <button
      onClick={() => setIsListening(!isListening)}
      className={`p-6 rounded-full transition-all transform hover:scale-105 shadow-xl ${
        isListening
          ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 animate-pulse"
          : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
      }`}
      aria-label={isListening ? "Stop listening" : "Start listening"}
    >
      {isListening ? (
        <MicOff className="w-8 h-8 text-white" />
      ) : (
        <Mic className="w-8 h-8 text-white" />
      )}
    </button>
  );
}
