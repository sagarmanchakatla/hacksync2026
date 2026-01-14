"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";

export interface FeedbackSystemHandle {
  speak: (text: string, priority?: "high" | "normal") => void;
  stop: () => void;
}

interface FeedbackSystemProps {
  isMuted: boolean;
}

const FeedbackSystem = forwardRef<FeedbackSystemHandle, FeedbackSystemProps>(
  ({ isMuted }, ref) => {
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
      if (typeof window !== "undefined") {
        synthRef.current = window.speechSynthesis;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      speak: (text: string, priority = "normal") => {
        if (isMuted || !synthRef.current) return;

        // If high priority, cancel current speech
        if (priority === "high") {
          synthRef.current.cancel();
        } else if (synthRef.current.speaking) {
          // If normal priority and already speaking, maybe skip or queue?
          // For now, let's just return to avoid overlapping noise
          return; 
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        
        synthRef.current.speak(utterance);
      },
      stop: () => {
        if (synthRef.current) {
          synthRef.current.cancel();
          setIsSpeaking(false);
        }
      },
    }));

    return null;
  }
);

FeedbackSystem.displayName = "FeedbackSystem";

export default FeedbackSystem;
