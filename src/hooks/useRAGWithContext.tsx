import { useRAGConfig } from "../context/RAGContext";
import { useRAGConversation } from "./useRAGConversation";
import { useRAGResponse } from "./useRAGResponse";

export const useRAGResponseContext = () => {
  const { config, baseUrl, recaptchaSiteKey } = useRAGConfig();
  return useRAGResponse(config, baseUrl!, recaptchaSiteKey);
};

export const useRAGConversationContext = () => {
  const { config, baseUrl, recaptchaSiteKey } = useRAGConfig();
  return useRAGConversation(config, baseUrl!, recaptchaSiteKey);
};
