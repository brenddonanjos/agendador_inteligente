import { Flex } from "antd";
import { useRef, useState } from "react";
import AudioRecorderButton from "../components/btnAudioRecorder";
import { sendAudioToSchedule } from "../services/scheduleService";

function SchedulePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioState, setAudioState] = useState<
    "idle" | "recording" | "recorded" | "sending"
  >("idle");

  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setAudioState("recording");
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioState("recorded");
    }
  };

  const sendAudio = async () => {
    if (!audioBlob) return;
    setAudioState("sending");
    setIsRecording(false);

    try {
      const response = await sendAudioToSchedule(audioBlob);
      console.log("Resposta do servidor:", response);
      setAudioState("idle");
      setAudioURL(null);
      setAudioBlob(null);
    } catch (error) {
      console.error("Erro ao enviar áudio:", error);
      setAudioState("recorded");
    }
  };

  const cancelRecording = () => {
    setAudioState("idle");
    setIsRecording(false);
    setRecordingTime(0);
  };

  return (
    <Flex wrap gap="small">
      <AudioRecorderButton
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onSendAudio={sendAudio}
        onCancelRecording={cancelRecording}
        audioState={audioState}
        recordingTime={recordingTime}
        isRecording={isRecording}
      />
      <br />
      {audioURL && (
        <div style={{ marginTop: "20px" }}>
          <h3>Áudio Gravado:</h3>
          <audio controls src={audioURL} />
          <br />
          <button onClick={() => sendAudio()}> Enviar Áudio</button>
        </div>
      )}
    </Flex>
  );
}

export default SchedulePage;
