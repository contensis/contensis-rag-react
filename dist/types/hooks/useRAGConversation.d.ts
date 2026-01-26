type Message = {
    role: "user" | "assistant";
    content: string;
};
export declare const useRAGConversation: (config: string, baseUrl: string, recaptchaSiteKey?: string) => {
    messages: Message[];
    loading: boolean;
    error: string | null;
    ask: (question: string, sections?: string[]) => Promise<void>;
};
export {};
