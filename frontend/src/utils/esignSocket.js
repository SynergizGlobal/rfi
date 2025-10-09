import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectEsignSocket = (txnId, onMessage) => {
	
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}ws`),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log("✅ Connected to WebSocket");
      stompClient.subscribe(`/topic/esign/${txnId}`, (msg) => {
        const body = JSON.parse(msg.body);
        console.log("📩 eSign Update:", body);
        onMessage(body);
      });
    },
    onStompError: (frame) => {
      console.error("❌ STOMP Error:", frame.headers["message"]);
    },
  });

  stompClient.activate();
};

export const disconnectEsignSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    console.log("🔌 WebSocket disconnected");
  }
};
