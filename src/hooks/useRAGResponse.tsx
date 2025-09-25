import { useCallback, useState } from "react";

const history = false;
const stream = true;

export const useRAGResponse = (config: string, baseUrl: string) => {
  const [response, setResponse] = useState<string>(""); // accumulated streamed text
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (question: string) => {
      setLoading(true);
      setError(null);
      setResponse("");

      try {
        const query = new URLSearchParams({
          question: question,
          config: config,
          history: String(history),
          stream: String(stream),
        }).toString();

        const payload = await fetch(`${baseUrl}/query-collection?${query}`, {
          method: "GET",
          credentials: true,
          headers: {
            Accept: "text/event-stream",
          },
        });

        if (!payload.body) throw new Error("No payload body");

        const reader = payload.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE messages are separated by double newlines
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || ""; // keep incomplete chunk

          for (const part of parts) {
            if (part.startsWith("event: done")) {
              setLoading(false);
              return;
            }

            if (part.startsWith("data:")) {
              try {
                const json = JSON.parse(part.replace("data: ", ""));
                if (json?.content) setResponse((prev) => prev + json.content);
              } catch (err) {
                console.error("Failed to parse SSE chunk", err, part);
              }
            }
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    },
    [config]
  );

  return { response, loading, error, ask };
};
