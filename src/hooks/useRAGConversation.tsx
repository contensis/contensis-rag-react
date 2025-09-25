import { useCallback, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const useRAGConversation = (config: string, baseUrl: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (question: string) => {
      // add the user’s message immediately
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams({
          question: question,
          config: config,
          history: String(true),
          stream: String(true),
        }).toString();

        const response = await fetch(`${baseUrl}/query-collection?${query}`, {
          method: "GET",
          credentials: 'include',
          headers: {
            Accept: "text/event-stream",
          },
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = "";
        let assistantMsg = ""; // accumulate assistant’s message

        // add a placeholder assistant message we’ll update while streaming
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("event: done")) {
              setLoading(false);
              return;
            }

            if (part.startsWith("data:")) {
              try {
                const json = JSON.parse(part.replace("data: ", ""));
                if (json?.content) {
                  assistantMsg += json.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantMsg,
                    };
                    return updated;
                  });
                }
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

  return { messages, loading, error, ask };
};
