"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ObjectDetector,
  FilesetResolver,
  Detection,
} from "@mediapipe/tasks-vision";

interface ObjectDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  onDetections?: (detections: Detection[]) => void;
}

export default function ObjectDetectorComponent({
  videoRef,
  isActive,
  onDetections,
}: ObjectDetectorProps) {
  const [detector, setDetector] = useState<ObjectDetector | null>(null);
  const requestRef = useRef<number>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Object Detector
  useEffect(() => {
    const initializeDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
        );
        const objectDetector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
            delegate: "GPU",
          },
          scoreThreshold: 0.5,
          runningMode: "VIDEO",
        });
        setDetector(objectDetector);
        console.log("Object Detector initialized");
      } catch (error) {
        console.error("Error initializing object detector:", error);
      }
    };

    initializeDetector();
  }, []);

  // Detection Loop
  useEffect(() => {
    if (!isActive || !detector || !videoRef.current) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      // Clear canvas when stopped
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const detect = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const detections = detector.detectForVideo(
          videoRef.current,
          performance.now()
        );

        drawDetections(detections.detections);
        
        if (onDetections) {
          onDetections(detections.detections);
        }
      }
      requestRef.current = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, detector, videoRef, onDetections]);

  const drawDetections = (detections: Detection[]) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection) => {
      if (!detection.boundingBox) return;

      const { originX, originY, width, height } = detection.boundingBox;
      
      // Draw box
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 4;
      ctx.strokeRect(originX, originY, width, height);

      // Draw label
      if (detection.categories && detection.categories.length > 0) {
        const category = detection.categories[0];
        const label = `${category.categoryName} ${Math.round(
          category.score * 100
        )}%`;
        
        ctx.fillStyle = "#00ff00";
        ctx.font = "18px Arial";
        ctx.fillText(label, originX, originY - 10);
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}
