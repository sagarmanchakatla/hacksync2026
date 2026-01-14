"use client";

import { useState, useEffect, useCallback } from "react";

interface GeminiAssistantProps {
  apiKey: string;
  isActive: boolean;
  userPrompt: string | null; // If null, do general analysis. If string, answer question.
  onResponse: (text: string) => void;
  captureFrame: () => string | null;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
}

export default function GeminiAssistant({
  apiKey,
  isActive,
  userPrompt,
  onResponse,
  captureFrame,
  onProcessingStart,
  onProcessingEnd,
}: GeminiAssistantProps) {
  const [lastProcessedPrompt, setLastProcessedPrompt] = useState<string | null>(
    null
  );

  const analyze = useCallback(
    async (promptText: string) => {
      if (!apiKey || !isActive) return;

      const imageData = captureFrame();
      if (!imageData) {
          console.warn("No image data captured");
          return;
      }

      onProcessingStart();
      try {
        const base64Image = imageData.split(",")[1];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inline_data: {
                        mime_type: "image/jpeg",
                        data: base64Image,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text;
          onResponse(text);
        }
      } catch (error) {
        console.error("Gemini analysis failed:", error);
        onResponse("Sorry, I couldn't analyze the scene.");
      } finally {
        onProcessingEnd();
      }
    },
    [apiKey, isActive, captureFrame, onProcessingStart, onProcessingEnd, onResponse]
  );

  // Effect to trigger analysis when userPrompt changes
  useEffect(() => {
    if (!userPrompt) {
      setLastProcessedPrompt(null);
      return;
    }

    if (userPrompt !== lastProcessedPrompt) {
      setLastProcessedPrompt(userPrompt);
      const fullPrompt = `You are a helpful vision assistant. The user asks: "${userPrompt}". Answer based on the image. Be concise and direct.`;
      analyze(fullPrompt);
    }
  }, [userPrompt, lastProcessedPrompt, analyze]);

  // Effect for continuous general analysis (optional, can be triggered by parent)
  // For now, we'll leave it to the parent to trigger "general" updates if needed, 
  // or we can add a timer here if "Continuous Mode" is strictly internal.
  // Given the requirement "continuously analyze", let's add a slow loop for general updates
  // ONLY if no user prompt is being processed.
  
  useEffect(() => {
      if (!isActive) return;

      const intervalId = setInterval(() => {
          if (!userPrompt) { // Only do general analysis if not answering a specific question
             analyze("Describe the scene in front of me and any potential hazards. Be concise.");
          }
      }, 5000); // 5 seconds interval

      return () => clearInterval(intervalId);
  }, [isActive, userPrompt, analyze]);


  return null;
}
