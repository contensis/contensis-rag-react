const BASE_URL = "http://rag-api.insytful.com/api/v1";
import React, { createContext, useContext } from "react";

type RAGConfig = {
  config: string;
  baseUrl?: string;
};

const RAGContext = createContext<RAGConfig | null>(null);

export const RAGProvider = ({
  children,
  baseUrl = BASE_URL,
  config,
}: {
  children: React.ReactNode;
  config: string;
  baseUrl?: string;
}) => {
  return (
    <RAGContext.Provider value={{ config, baseUrl }}>
      {children}
    </RAGContext.Provider>
  );
};

export const useRAGConfig = () => {
  const ctx = useContext(RAGContext);
  if (!ctx) throw new Error("useRAGConfig must be used within RAGProvider");
  return ctx;
};
