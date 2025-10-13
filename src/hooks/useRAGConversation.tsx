import { useCallback, useState } from "react";
import HuggingFaceEmbeddings from "../providers/hugging-face.provider";
import { RAGConfig } from "../context/RAGContext";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const model = new HuggingFaceEmbeddings({
  model: "Xenova/multilingual-e5-large",
});

export const useRAGConversation = (
  config: RAGConfig["config"],
  baseUrl: RAGConfig["baseUrl"]
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (question: string) => {
      setMessages((m) => [...m, { role: "user", content: question }]);
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          question: question,
          config: config.collection,
          history: "true",
          stream: "true",
          vectorised: String(config.preVectorised),
        });

        let response: Response;

        if (config.preVectorised) {
          const rewriteParams = new URLSearchParams({
            question,
            config: config.collection,
            history: "true",
            stream: "true",
            vectorised: String(config.preVectorised),
          });

          const rewriteRes = await fetch(
            `${baseUrl}/rewrite-query?${rewriteParams}`,
            {
              credentials: "include",
            }
          );
          if (!rewriteRes.ok)
            throw new Error(`Rewrite failed: ${rewriteRes.status}`);

          const { rewritten } = await rewriteRes.json();

          if (!rewritten) throw new Error("Rewrite failed");

          const vector = await model.embed(rewritten);
          response = await fetch(`${baseUrl}/query-collection?${queryParams}`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
            },
            body: JSON.stringify({ vector }),
          });
        } else {
          response = await fetch(`${baseUrl}/query-collection?${queryParams}`, {
            credentials: "include",
            headers: { Accept: "text/event-stream" },
          });
        }

        if (!response.ok)
          throw new Error(`Query request failed: ${response.status}`);
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let assistantMsg = "";

        setMessages((m) => [...m, { role: "assistant", content: "" }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("event: done")) {
              reader.releaseLock();
              setLoading(false);
              return;
            }
            if (part.startsWith("data:")) {
              try {
                const json = JSON.parse(part.slice(5));
                if (json.content) {
                  assistantMsg += json.content;
                  setMessages((msgs) => {
                    const updated = [...msgs];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantMsg,
                    };
                    return updated;
                  });
                }
              } catch (err) {
                setError("Invalid SSE chunk");
              }
            }
          }
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    },
    [config, baseUrl]
  );

  return { messages, loading, error, ask };
};
