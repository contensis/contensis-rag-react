export declare const useRAGResponseContext: () => {
    response: string;
    loading: boolean;
    error: string | null;
    ask: (question: string) => Promise<void>;
};
export declare const useRAGConversationContext: () => {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    loading: boolean;
    error: string | null;
    ask: (question: string) => Promise<void>;
};
