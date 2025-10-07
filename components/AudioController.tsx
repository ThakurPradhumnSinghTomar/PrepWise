'use client';
import { useState, useRef, Dispatch, SetStateAction } from "react";
import { Mic, Square, Play, FileText } from "lucide-react";
import { answers } from "./Question";
import next from "next";

type props = {
  setAnswers: Dispatch<SetStateAction<answers>>;
  answers: answers;
  questionId: number;
}

export default function AudioController({ setAnswers, answers, questionId }: props) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to record");
  const [transcription, setTranscription] = useState<string>("");
  const [loading, setLoading] = useState(false);

        /*
        const mediaRecorderRef = useRef<MediaRecorder | null>(null);

        Why: We need a persistent reference to the MediaRecorder instance that survives React re-renders
        What: Creates a ref to hold the browser's MediaRecorder API object, which handles audio recording


        const audioChunksRef = useRef<Blob[]>([]);

        Why: We need to collect audio data chunks as they're recorded without triggering re-renders
        What: Creates a ref to store an array of Blob objects (audio data pieces) that accumulate during recording
        Both use useRef instead of useState because:

        They don't need to trigger UI updates when changed
        They need to persist their values across component re-renders
        They're used for imperative operations (starting/stopping recording, collecting data) rather than declarative UI state
        */


  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

        /*
        what is mediaRecorderRef?

        A Web API built into browsers for recording audio/video from user's microphone/camera

        Provides methods like start(), stop(), pause(), resume()

        Fires events like ondataavailable (when audio chunks are ready) and onstop (when recording ends)

        Why use a ref for it?
        Persistence: The MediaRecorder instance needs to survive React component re-renders
        No UI updates needed: Changing the MediaRecorder doesn't require updating the UI
        Imperative control: We need direct access to call its methods (start(), stop())

        How it's used in your code:
        Created: mediaRecorderRef.current = new MediaRecorder(stream)
        Started: mediaRecorderRef.current.start()
        Stopped: mediaRecorderRef.current.stop()
        Event handlers: Set up ondataavailable and onstop callbacks

        The | null type indicates it starts as null and gets assigned a MediaRecorder instance when recording begins.

        */

  const startRecording = async () => {
    setStatus("Requesting microphone...");
    setTranscription("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      /*

        Blob (Binary Large Object)
        What: A Web API for representing raw binary data (like files, images, audio)
        Where from: Built into all modern browsers, part of the File API specification
        Purpose here: Combines all the audio chunks into a single binary file
        new Blob(audioChunksRef.current, { type: "audio/webm" }) creates an audio file from the recorded chunks

*/
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setStatus("Sending audio to backend...");
      setLoading(true);

      /*
        URL.createObjectURL()
        What: A Web API method that creates a temporary URL pointing to a Blob/File object
        Where from: Built into browsers, part of the URL API
        Purpose here: Creates a playable URL for the audio so you can use it in an <audio> element
        The URL looks like: blob:http://localhost:3000/abc123-def456
*/

      // Send audio to backend
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

        /*
        FormData
        What: A Web API for building form data (key-value pairs) that can include files
        Where from: Built into browsers, part of the XMLHttpRequest specification
        Purpose here: Packages the audio blob to send to your backend API
        formData.append("audio", blob, "recording.webm") adds the audio file with the key "audio"
        */

      try {
        const res = await fetch("/api/vapi/speech-to-text", {

          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await res.json();
        
        if (data.success) {
          setTranscription(data.text);
          setStatus("Transcription complete!");
          const nextAns = `Answer of ${questionId} question is : ${data.text}`;
          setAnswers(prevAnswers => [...prevAnswers, nextAns]);
          console.log("New answer added:", nextAns);
        } else {
          setStatus("Error: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        setStatus("Error processing audio");
      } finally {
        setLoading(false);
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setStatus("Recording...");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setStatus("Processing...");
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="w-full bg-slate-800/50 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Audio Transcriber</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full">
                {recording && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <span className="text-sm text-slate-200">{status}</span>
              </div>
            </div>

            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                recording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : loading
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {recording ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Record</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {(audioURL || loading) && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          {audioURL && (
            <div className="mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <Play className="w-5 h-5 text-green-400" />
                <span className="text-slate-200 font-medium">Recorded Audio</span>
              </div>
              <audio src={audioURL} controls className="w-full" />
            </div>
          )}

          {loading && (
            <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-slate-300">Transcribing audio...</span>
              </div>
            </div>
          )}

          {transcription && !loading && (
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-slate-200 font-medium text-lg">Transcription</span>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{transcription}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}