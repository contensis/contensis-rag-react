export declare const useRAGResponse: (config: string, baseUrl: string) => {
    response: string;
    loading: boolean;
    error: string | null;
    ask: (question: string) => Promise<void>;
};
