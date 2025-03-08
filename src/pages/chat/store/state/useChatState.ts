import createChatStateHook from "./createChatStateHook";
import ChatStateManager from "./chatStateManager";

export default function useChatStore() {
  return createChatStateHook(ChatStateManager)
};
