import { useState, useRef, useCallback } from "react";

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


/**
 * Mic button that records audio, sends it to /transcribe,
 * and calls onTranscript(text) with the result.
 */
const VoiceInputButton = ({ onTranscript, disabled }) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // webm/opus is widely supported and small; backend (whisper) handles it fine via ffmpeg
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        if (blob.size === 0) return;
        await sendForTranscription(blob);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic access failed:", err);
      setError("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setRecording(false);
  }, []);

  const sendForTranscription = async (blob) => {
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");

      const res = await fetch(`${API_BASE_URL}/transcribe`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      if (data.text) onTranscript(data.text.trim());
      else setError("No speech detected");
    } catch (err) {
      console.error("Transcription failed:", err);
      setError("Transcription failed");
    } finally {
      setProcessing(false);
    }
  };

  const toggle = () => (recording ? stopRecording() : startRecording());

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled || processing}
      title={recording ? "Stop recording" : "Dictate prompt"}
      style={{
        background: recording ? "rgba(255,60,60,.18)" : "rgba(255,255,255,.05)",
        border: `1px solid ${recording ? "rgba(255,60,60,.4)" : "rgba(255,255,255,.1)"}`,
        borderRadius: "9999px",
        color: recording ? "rgba(255,120,120,.95)" : "rgba(255,255,255,.6)",
        cursor: disabled || processing ? "not-allowed" : "pointer",
        fontSize: "13px",
        padding: "6px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        position: "relative",
      }}
    >
      {processing ? (
        <span
          style={{
            width: "12px",
            height: "12px",
            border: "1.5px solid rgba(255,255,255,.2)",
            borderTopColor: "rgba(139,92,246,.9)",
            borderRadius: "50%",
            animation: "spin .7s linear infinite",
          }}
        />
      ) : recording ? (
        <>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "2px",
              background: "rgba(255,80,80,.95)",
              animation: "pulseRec 1s ease-in-out infinite",
            }}
          />
          Stop
        </>
      ) : (
        <>🎤</>
      )}
      <style>{`
        @keyframes pulseRec { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
      {error && (
        <span
          style={{
            position: "absolute",
            bottom: "120%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1a1a1a",
            border: "1px solid rgba(255,80,80,.3)",
            color: "rgba(255,140,140,.9)",
            fontSize: "10px",
            padding: "3px 8px",
            borderRadius: "6px",
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </span>
      )}
    </button>
  );
};

export default VoiceInputButton;