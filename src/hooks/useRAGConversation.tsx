import { useCallback, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const useRAGConversation = (config: string, baseUrl: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const { executeRecaptcha } = useGoogleReCaptcha();

  const ask = useCallback(
    async (question: string) => {

      let recaptchaToken: string | null = null;
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("rag_search");
      }

      // add the user’s message immediately
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          question,
          config,
          history: String(true),
          stream: String(true),
        });

        const query = params.toString();
        const headers = new Headers({ Accept: "text/event-stream" });

        // only include token if we generated one
        if (recaptchaToken) headers.append("X-Recaptcha-Token", recaptchaToken);

        const sid = localStorage.getItem('rag-session-id');
        if (sid) headers.append('X-Session-Id', sid);

        const response = await fetch(`${baseUrl}/query-collection?${query}`, {
          method: "GET",
          headers,
        });

        if(response.headers.has('X-Session-Id')) {
          // biome-ignore lint/style/noNonNullAssertion: We've just checked above.
          localStorage.setItem('rag-session-id', response.headers.get('X-Session-Id')!);
        }

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
    [config, baseUrl]
  );

  return { messages, loading, error, ask };
};
