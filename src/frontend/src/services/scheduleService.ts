import axios from "axios";

// const API_URL = "http://scheduler-backend:5000";
const API_URL = import.meta.env.VITE_API_URL || "http://scheduler-backend:5000";

export const sendAudioToSchedule = async (user_id: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "agendamento.webm");

  const response = await axios.post(`${API_URL}/agents/schedule/${user_id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
