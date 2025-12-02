const BASE_URL = "http://rag-api.insytful.com/api/v1";
import React, { createContext, useContext } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

type RAGConfig = {
  config: string;
  baseUrl?: string;
  recaptchaSiteKey?: string;
};

const RAGContext = createContext<RAGConfig | null>(null);

export const RAGProvider = ({
  children,
  baseUrl = BASE_URL,
  config,
  recaptchaSiteKey,
}: {
  children: React.ReactNode;
  config: string;
  baseUrl?: string;
  recaptchaSiteKey?: string;
}) => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey || ""}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <RAGContext.Provider value={{ config, baseUrl, recaptchaSiteKey }}>
        {children}
      </RAGContext.Provider>
    </GoogleReCaptchaProvider>
  );
};

export const useRAGConfig = () => {
  const ctx = useContext(RAGContext);
  if (!ctx) throw new Error("useRAGConfig must be used within RAGProvider");
  return ctx;
};