import { Divider, Flex } from "antd";
import { useEffect, useRef, useState } from "react";
import AudioRecorderButton from "../components/btnAudioRecorder";
import { sendAudioToSchedule } from "../services/scheduleService";
import { getAuthStatus, getAuthUrl } from "../services/googleAuthService";
import { getCookie, setCookie } from "../utils/cookies";

import type { ResponseSchedule } from "../interfaces/responseSchedule";
import WarningCard from "../components/warningCard";
import RobotArea from "../components/robotArea";
import { AxiosError } from "axios";

function SchedulePage() {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioState, setAudioState] = useState<
    "idle" | "recording" | "recorded" | "sending"
  >("idle");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [responseSchedule, setResponseSchedule] =
    useState<ResponseSchedule | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let userSessionId = getCookie("user_id");
    if (!userSessionId) {
      userSessionId = crypto.randomUUID();
      setCookie("user_id", userSessionId, 30);
    }
    const checkGoogleAuth = async () => {
      try {
        const authStatus = await getAuthStatus(userSessionId);
        setIsAuthenticated(authStatus.authenticated);

        if (authStatus.authenticated) return;

        const url = await getAuthUrl(userSessionId);
        window.open(
          url.auth_url,
          "google-auth",
          "width=500,height=600,scrollbars=yes,resizable=yes"
        );

        const checkAuthInterval = setInterval(async () => {
          const authStatus = await getAuthStatus(userSessionId);
          setIsAuthenticated(authStatus.authenticated);
          if (authStatus.authenticated) {
            clearInterval(checkAuthInterval);
          }
        }, 3000);

        // Limpar interval após 5 minutos
        setTimeout(() => {
          console.log("Intervalo de 5 minutos expirado");
          if (checkAuthInterval) clearInterval(checkAuthInterval);
        }, 300000);
      } catch (error) {
        console.error("Erro ao verificar autenticação Google:", error);
      }
    };
    checkGoogleAuth();
  }, [isAuthenticated]);

  const startRecording = async () => {
    setResponseSchedule(null);
    setAudioState("recording");
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
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone");
    }
  };

  const stopRecording = () => {
    setResponseSchedule(null);
    if (
      audioState !== "recording" ||
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state == "inactive"
    )
      return;

    mediaRecorderRef.current.stop();
    setAudioState("recorded");
  };

  const sendAudio = async () => {
    setResponseSchedule(null);
    if (!audioBlob) return;
    setAudioState("sending");

    try {
      const userId = getCookie("user_id") || "user_default";
      const response = await sendAudioToSchedule(userId, audioBlob);
      console.log("Resposta do servidor:", response);
      setAudioState("idle");
      setAudioURL(null);
      setAudioBlob(null);
      setResponseSchedule({
        success: true,
        message: "Agendamento realizado com sucesso! ",
        link: response.link,
      });
    } catch (error) {
      let messageError = "Falha ao tentar agendar seu compromisso";
      if (error && error instanceof AxiosError) {
        messageError = error.response?.data?.message || messageError;
      }
      console.log("Erro ao agendar evento:", messageError);
      setAudioState("recorded");
      setResponseSchedule({
        success: false,
        message: messageError,
        link: null,
      });
    }
  };

  const cancelRecording = () => {
    setAudioState("idle");
    setRecordingTime(0);
    setAudioURL(null);
    setAudioBlob(null);
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setResponseSchedule(null);
  };

  return (
    <Flex vertical align="center" justify="center" gap="small">
      {!isAuthenticated && (
        <WarningCard message="Login e Autorização Google necessários para continuar" />
      )}
      
      <RobotArea
        audioState={audioState}
        responseSchedule={responseSchedule || undefined}
      />
      <Divider className="robot-divider" />
      <AudioRecorderButton
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onSendAudio={sendAudio}
        onCancelRecording={cancelRecording}
        audioState={audioState}
        audioURL={audioURL}
        recordingTime={recordingTime}
        isAuthenticated={isAuthenticated}
      />
    </Flex>
  );
}

export default SchedulePage;
