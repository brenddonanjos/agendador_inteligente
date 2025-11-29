import "./style.css";

interface AudioRecorderButtonProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendAudio: () => void;
  onCancelRecording: () => void;
  audioState: "idle" | "recording" | "recorded" | "sending";
  recordingTime: number;
  isRecording: boolean;
}

function AudioRecorderButton(props: AudioRecorderButtonProps) {

  const handleClick = () => {
    if (props.isRecording) {
      props.onStopRecording();
    } else {
      props.onStartRecording();
    }
  };

  return (
    <div>
      <h2>Gravador de Áudio</h2>

      <button
        onMouseDown={props.onStartRecording}
        onMouseUp={props.onStopRecording}
        onMouseLeave={props.isRecording ? props.onStopRecording : undefined}
      >
        {props.isRecording
          ? "🔴 Gravando... (solte para parar)"
          : "🎤 Segure para gravar"}
      </button>

      <br />
      <br />

      <button onClick={handleClick}>
        {props.isRecording ? "⏹ Parar Gravação" : "▶ Iniciar Gravação"}
      </button>
    </div>
  );
}

export default AudioRecorderButton;
