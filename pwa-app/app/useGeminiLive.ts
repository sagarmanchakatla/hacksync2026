import { useState, useEffect, useRef, useCallback } from 'react';

const MODEL = "models/gemini-2.0-flash-exp";
// const API_KEY = "AIzaSyBemxFCKVsg6JQDnNY_g42s3Yn2cGouju4"
const API_KEY = "AIzaSyDHrbf_cq684zOkCHW4ZezDjC5qdAH0js8"
const HOST = "generativelanguage.googleapis.com";
const URI = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

export function useGeminiLive() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(URI);
    
    ws.onopen = () => {
      console.log("Connected to Gemini Live");
      // Initial Setup Message
      ws.send(JSON.stringify({
        setup: {
          model: MODEL,
          generationConfig: { responseModalities: ["AUDIO"] }
        }
      }));
      setIsStreaming(true);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setIsStreaming(false);
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data as string);
      
      // Handle Audio Output from Gemini
      if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
        const audioData = data.serverContent.modelTurn.parts[0].inlineData.data;
        playAudioChunk(audioData);
      }
    };

    ws.onclose = (event) => {
        console.log("Disconnected", event.code, event.reason);
        setIsStreaming(false);
    };
    setSocket(ws);
  }, []);

  // Audio Playback Helper
  const playAudioChunk = async (base64Audio: string) => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    
    // Convert PCM to AudioBuffer and play
    // Note: Simple implementation; for production, use an AudioWorklet or queue
    const float32Data = new Float32Array(bytes.length / 2);
    const dataView = new DataView(bytes.buffer);
    
    for (let i = 0; i < bytes.length / 2; i++) {
      float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
    }
    
    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  // Start Recording (Microphone)
  const startRecording = async () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new AudioContext({ sampleRate: 16000 }); // Downsample input
    const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
    
    // Use ScriptProcessor (deprecated but simple) or AudioWorklet (recommended)
    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    
    processorRef.current.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      // Convert Float32 to Int16 PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      
      // Base64 Encode and Send
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(pcmData.buffer))
      );
      
      socket.send(JSON.stringify({
        realtimeInput: {
          mediaChunks: [{
            mimeType: "audio/pcm;rate=16000",
            data: base64Audio
          }]
        }
      }));
    };

    source.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  const sendVideoFrame = (base64Image: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const base64Data = base64Image.split(",")[1];

    socket.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{
          mimeType: "image/jpeg",
          data: base64Data
        }]
      }
    }));
  };

  const disconnect = () => {
    socket?.close();
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
  };

  return { connect, disconnect, startRecording, isStreaming, sendVideoFrame };
}
