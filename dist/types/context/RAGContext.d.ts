import React from "react";
type RAGConfig = {
    config: string;
    baseUrl?: string;
    recaptchaSiteKey?: string;
};
export declare const RAGProvider: ({ children, baseUrl, config, recaptchaSiteKey, }: {
    children: React.ReactNode;
    config: string;
    baseUrl?: string;
    recaptchaSiteKey?: string;
}) => React.JSX.Element;
export declare const useRAGConfig: () => RAGConfig;
export {};
