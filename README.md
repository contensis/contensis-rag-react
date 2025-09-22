# RAG React Hooks

A lightweight set of React hooks for interacting with a Retrieval-Augmented Generation (RAG) backend using **Server-Sent Events (SSE)**.

This package provides two main hooks:

- `useRAGResponse` – for single-turn responses (simple Q&A).
- `useRAGConversation` – for multi-turn chat-like conversations with context.

It also includes a `RAGProvider` and context hooks for cleaner integration.

---

## 🚀 Installation

```bash
npm install contensis-rag-react
# or
yarn add contensis-rag-react
```

---

## ⚙️ Backend Configuration (`baseUrl`)

By default, the hooks expect your backend to be available at:

```
/contensis-ai-search/api/v1
```

You can **override this** using:

### Via Context (Recommended)

Pass a `baseUrl` into the `RAGProvider`. This is the most flexible option, as it allows you to change URLs at runtime or between environments.

```tsx
import { RAGProvider } from "contensis-rag-react";

function App() {
  return (
    <RAGProvider
      config="contensis-dev"
      baseUrl="https://my-api.example.com/api/v1"
    >
      <MyComponent />
    </RAGProvider>
  );
}
```

---

## 📦 Hooks Overview

### `useRAGResponse(collection: string)`

Fetches a single response from the RAG backend. Best for **Q\&A without conversation history**.

```tsx
import { useRAGResponse } from "contensis-rag-react";

function QAComponent() {
  const { response, loading, error, ask } = useRAGResponse("contensis-dev");

  return (
    <div>
      <button onClick={() => ask("What is RAG?")}>Ask</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {response && <p>Answer: {response}</p>}
    </div>
  );
}
```

---

### `useRAGConversation(config: string)`

Maintains a conversation history between user and assistant.

```tsx
import { useRAGConversation } from "contensis-rag-react";

function ChatComponent() {
  const { messages, loading, error, ask } = useRAGConversation("contensis-dev");

  return (
    <div>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{msg.role}:</strong> {msg.content}
          </li>
        ))}
      </ul>

      <button onClick={() => ask("Tell me about vector search.")}>Ask</button>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

---

## 🎯 Context-based Usage

Instead of passing `config` everywhere, wrap your app with `RAGProvider`:

```tsx
import { RAGProvider } from "contensis-rag-react";

function App() {
  return (
    <RAGProvider config="contensis-dev">
      <MyComponent />
    </RAGProvider>
  );
}
```

Then use the context-aware hooks:

```tsx
import {
  useRAGResponseContext,
  useRAGConversationContext,
} from "contensis-rag-react";

function MyComponent() {
  const { response, ask } = useRAGResponseContext();
  const { messages } = useRAGConversationContext();

  return (
    <div>
      <button onClick={() => ask("What is RAG?")}>Ask with Context</button>
      <pre>{response}</pre>

      <h4>Conversation</h4>
      {messages.map((m, i) => (
        <p key={i}>
          <b>{m.role}:</b> {m.content}
        </p>
      ))}
    </div>
  );
}
```

---

## 📖 API Reference

### `useRAGResponse(collection)`

- **response**: `string` – accumulated markdown text from assistant.
- **loading**: `boolean` – true while waiting.
- **error**: `string | null` – error message if failed.
- **ask(question: string)**: function to query backend.

### `useRAGConversation(collection)`

- **messages**: `Message[]` – array of `{ role: "user" | "assistant", content: string }`.
- **loading**: `boolean`.
- **error**: `string | null`.
- **ask(question: string)**: function to send message and stream back assistant response.

### `RAGProvider`

Props:

- **collection**: `string` – the backend collection name.
- **baseUrl**: `string` (optional) – API base URL. Defaults to `/contensis-ai-search/api/v1`.
- **children**: React nodes.

### `useRAGResponseContext` / `useRAGConversationContext`

Same as above, but auto-read `collection` and `baseUrl` from `RAGProvider`.

---
