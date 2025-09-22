import { useRAGConfig } from "../context/RAGContext";
import { useRAGConversation } from "./useRAGConversation";
import { useRAGResponse } from "./useRAGResponse";

export const useRAGResponseContext = () => {
  const { config, baseUrl } = useRAGConfig();
  return useRAGResponse(config, baseUrl!);
};

export const useRAGConversationContext = () => {
  const { config, baseUrl } = useRAGConfig();
  return useRAGConversation(config, baseUrl!);
};
