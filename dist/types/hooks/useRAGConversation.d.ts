type Message = {
    role: "user" | "assistant";
    content: string;
};
export declare const useRAGConversation: (config: string, baseUrl: string) => {
    messages: Message[];
    loading: boolean;
    error: string | null;
    ask: (question: string) => Promise<void>;
};
export {};
