import { useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/lib/auth";

export function useRealtimeUpdates() {
  const { user } = useAuth();
  const { isConnected, lastMessage, sendMessage } = useWebSocket(user?.id);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
