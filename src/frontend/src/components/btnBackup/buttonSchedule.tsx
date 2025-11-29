import "./style.css";
import { Button, Tooltip } from "antd";
import {
  AudioOutlined,
  PauseOutlined,
  SendOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { Avatar, Typography, Divider, Card } from "antd";
import { RobotOutlined, SoundOutlined } from "@ant-design/icons";
import axios from "axios";

const { Text } = Typography;

const API_URL = "http://localhost:5000";

interface AudioRecorderButtonProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendAudio: () => void;
  onCancelRecording: () => void;
  audioState: "idle" | "recording" | "recorded" | "sending";
  recordingTime: number;
  isRecording: boolean;
}

function AudioRecorderButton(
  props: AudioRecorderButtonProps
) {
  console.log(props.audioState);

  const getButtonAction = () => {
    switch (props.audioState) {
      case "idle":
        return props.onStartRecording;
      case "recording":
        return props.onStopRecording;
      case "recorded":
        return props.onSendAudio;
      case "sending":
        return () => {};
      default:
        return props.onStartRecording;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getButtonConfig = () => {
    switch (props.audioState) {
      case "idle":
        return {
          icon: <AudioOutlined />,
          className: "idle",
          background: "linear-gradient(135deg, #13C2C2, #1890ff)",
          boxShadow:
            "0 0 15px rgba(19, 194, 194, 0.4), 0 0 30px rgba(19, 194, 194, 0.2)",
        };

      case "recording":
        return {
          icon: <PauseOutlined />,
          className: "recording",
          background: "linear-gradient(135deg, #ff4d4f, #ff7a45)",
          boxShadow:
            "0 0 15px rgba(255, 77, 79, 0.4), 0 0 30px rgba(255, 77, 79, 0.2)",
        };

      case "recorded":
        return {
          icon: <SendOutlined />,
          className: "recorded",
          background: "linear-gradient(135deg, #52c41a, #73d13d)",
          boxShadow:
            "0 0 15px rgba(82, 196, 26, 0.4), 0 0 30px rgba(82, 196, 26, 0.2)",
        };

      case "sending":
        return {
          icon: <LoadingOutlined spin />,
          className: "sending",
          background: "linear-gradient(135deg, #722ed1, #9254de)",
          boxShadow:
            "0 0 15px rgba(114, 46, 209, 0.4), 0 0 30px rgba(114, 46, 209, 0.2)",
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="audio-recorder-container">
      <div className="robot-section">
        <Avatar size={80} icon={<RobotOutlined />} className="robot-avatar" />
        <div className="sound-waves">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`wave wave-${i} ${props.isRecording ? "active" : ""}`}
            />
          ))}
        </div>
        <Card className="robot-response-card" size="small">
          <Text className="robot-text">
            {props.isRecording
              ? "Estou ouvindo..."
              : "Olá! Clique no botão para falar comigo"}
          </Text>
        </Card>
      </div>

      <Divider className="robot-divider" />

      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={buttonConfig?.icon}
        className={`futuristic-record-button ${buttonConfig?.className}`}
        onClick={getButtonAction()}
        disabled={props.audioState === "sending"}
        style={{
          width: "6rem",
          height: "6rem",
          fontSize: "1.6rem",
          background: buttonConfig?.background,
          borderColor: "transparent",
          boxShadow: buttonConfig?.boxShadow,
          transition: "all 0.3s ease-in-out",
          opacity: props.audioState === "sending" ? 0.8 : 1,
        }}
      />

      {props.isRecording && (
        <div className="recording-timer">
          <span className="timer-text">{formatTime(props.recordingTime)}</span>
        </div>
      )}

      {(props.audioState === "recorded" || props.audioState === "sending") && (
        <div className="audio-status">
          <Text className="status-text">
            {props.audioState === "recorded" &&
              `Áudio gravado (${formatTime(props.recordingTime)})`}
            {props.audioState === "sending" && `Enviando áudio...`}
          </Text>
          {props.audioState === "recorded" && (
            <Button
              size="small"
              type="text"
              onClick={props.onCancelRecording}
              style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.5rem" }}
            >
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default AudioRecorderButton;

