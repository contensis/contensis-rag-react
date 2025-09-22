import React from 'react';

declare const RAGProvider: ({ children, baseUrl, config, }: {
    children: React.ReactNode;
    config: string;
    baseUrl?: string;
}) => React.JSX.Element;

declare const useRAGResponseContext: () => {
    response: string;
    loading: boolean;
    error: string | null;
    ask: (question: string) => Promise<void>;
};
declare const useRAGConversationContext: () => {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    loading: boolean;
    error: string | null;
    ask: (question: string) => Promise<void>;
};

declare const useRAGResponse: (config: string, baseUrl: string) => {
    response: string;
    loading: boolean;
    error: string | null;
    ask: (question: string) => Promise<void>;
};

type Message = {
    role: "user" | "assistant";
    content: string;
};
declare const useRAGConversation: (config: string, baseUrl: string) => {
    messages: Message[];
    loading: boolean;
    error: string | null;
    ask: (question: string) => Promise<void>;
};

export { RAGProvider, useRAGConversation, useRAGConversationContext, useRAGResponse, useRAGResponseContext };
