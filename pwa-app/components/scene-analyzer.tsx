"use client";

import { useState, useEffect, useRef } from "react";

interface SceneAnalyzerProps {
  apiKey: string;
  isActive: boolean;
  onAnalysisResult: (description: string) => void;
  captureFrame: () => string | null;
  interval?: number;
  context?: string; // Extra context from object detection
}

export default function SceneAnalyzer({
  apiKey,
  isActive,
  onAnalysisResult,
  captureFrame,
  interval = 5000,
  context = "",
}: SceneAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive || !apiKey) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const analyze = async () => {
      if (isAnalyzing) return;

      const imageData = captureFrame();
      if (!imageData) return;

      setIsAnalyzing(true);
      try {
        const base64Image = imageData.split(",")[1];
        
        // Construct prompt with context if available
        let promptText = "You are an AI assistant helping a visually impaired person. Analyze this image and provide a concise description (2-3 sentences) of the scene and any potential hazards.";
        if (context) {
          promptText += ` I have detected the following objects nearby: ${context}. Please incorporate this into your analysis if relevant.`;
        }

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
          const description = data.candidates[0].content.parts[0].text;
          onAnalysisResult(description);
        }
      } catch (error) {
        console.error("Scene analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Initial analysis
    analyze();

    // Periodic analysis
    intervalRef.current = setInterval(analyze, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, apiKey, interval, context, captureFrame]); // Removed isAnalyzing from deps to avoid loop issues

  return null; // Logic only component
}
