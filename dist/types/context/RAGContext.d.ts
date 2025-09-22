import React from "react";
type RAGConfig = {
    config: string;
    baseUrl?: string;
};
export declare const RAGProvider: ({ children, baseUrl, config, }: {
    children: React.ReactNode;
    config: string;
    baseUrl?: string;
}) => React.JSX.Element;
export declare const useRAGConfig: () => RAGConfig;
export {};
