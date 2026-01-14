"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

interface CameraFeedProps {
  onStreamReady?: (stream: MediaStream) => void;
  isActive: boolean;
}

export interface CameraFeedHandle {
  captureFrame: () => string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  ({ onStreamReady, isActive }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        if (!videoRef.current) return null;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.drawImage(videoRef.current, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.8);
      },
      videoRef: videoRef,
    }));

    useEffect(() => {
      let mounted = true;

      const startCamera = async () => {
        if (!isActive) return;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          if (!mounted) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          if (onStreamReady) {
            onStreamReady(stream);
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
        }
      };

      const stopCamera = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      if (isActive) {
        startCamera();
      } else {
        stopCamera();
      }

      return () => {
        mounted = false;
        stopCamera();
      };
    }, [isActive, onStreamReady]);

    return (
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
);

CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
