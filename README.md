# RAG Workspace frontend

A Next.js App Router frontend for a document-grounded, multimodal chat workspace. Users can upload and manage documents, ask questions across their workspace or a selected document, and inspect citations back to the source page—including image and table evidence returned by the API.

## Run locally

Requirements: Node.js, npm, and a running backend API.

1. Create `.env.local` and set the backend URL:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   Replace the example URL with the backend's reachable base URL. Do not commit real credentials or secrets.

2. Install dependencies and start Next.js:

   ```bash
   npm install
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Architecture at a glance

```text
app/                         Routes, root providers, and global styles
  (auth)/                    Sign-in and sign-up pages
  api/auth/session/           Same-origin session-cookie handlers
  dashboard/                 Workspace landing route
  chat/[threadId]/            Conversation route
  features/
    auth/                     Auth forms, hooks, services, schemas, and types
    workspace/                Documents, chat, citations, and thread management
components/                   Shared app components and shadcn UI primitives
lib/                          API client, auth helpers, query client, utilities
proxy.ts                      Optimistic route redirects for auth/workspace pages
```

### Routing and layout

- [`app/page.tsx`](./app/page.tsx) is the public landing page and interactive multimodal product demo.
- [`app/(auth)/`](./app/(auth)) contains sign-in and sign-up screens.
- [`app/dashboard/page.tsx`](./app/dashboard/page.tsx) and [`app/chat/[threadId]/page.tsx`](./app/chat/[threadId]/page.tsx) both use the shared `WorkspacePage`, which coordinates the sidebar, selected document, thread, uploads, and chat.
- [`app/layout.tsx`](./app/layout.tsx) provides React Query, theme, tooltip, and toast providers.
- Styling uses Tailwind CSS v4 and shadcn theme tokens in [`app/globals.css`](./app/globals.css). The theme selector supports light, dark, and system modes.

### Feature organization

Feature code is grouped by domain under [`app/features/`](./app/features):

- `auth/` contains forms, validation schemas, typed API services, and React Query hooks. Current-user data comes from `/auth/me`.
- `workspace/` contains document and thread services/hooks, workspace UI, streamed chat, Markdown rendering, citation previews, usage metadata, and multimodal evidence components.
- API calls and API response types stay with their feature; reusable UI primitives live under [`components/ui/`](./components/ui).

For server state, feature hooks use TanStack Query. For example, document upload/deletion invalidates the documents query, and document status queries refresh while a document remains `uploaded`.

### Document workflow

[`document.service.ts`](./app/features/workspace/services/document.service.ts) implements:

- `GET /documents` to list documents.
- `POST /documents/upload` to upload a file.
- `DELETE /documents/delete/{doc_id}` to remove a document.
- `GET /documents/status/{doc_id}` to check processing status.

The document list displays `Processing` for uploaded/in-progress documents and polls their status every 60 seconds. Processed documents stop polling. Users can select a document for chat, preview its file, or delete it with confirmation.

### Chat and multimodal evidence

- [`chat-service.ts`](./app/features/workspace/services/chat-service.ts) manages threads and persisted messages.
- [`chat-stream.ts`](./app/features/workspace/services/chat-stream.ts) reads server-sent events from `POST /chat/stream`, updating the assistant response as tokens arrive and collecting citations.
- [`use-chat.ts`](./app/features/workspace/hooks/use-chat.ts) coordinates history loading, stream lifecycle, cancellation, and UI state.
- [`markdown-renderer.tsx`](./app/features/workspace/components/markdown-renderer.tsx) renders Markdown during and after streaming.
- [`chat-citation.tsx`](./app/features/workspace/components/chat-citation.tsx) previews citation content and links to source files or image URLs. Citation records include modality, page, source URL, and optional image URL.
- Token usage returned with message metadata is typed and displayed by [`message-usage.tsx`](./app/features/workspace/components/message-usage.tsx).

The multimodal retrieval and answer generation happen in the backend. The frontend streams the response and renders the text, citations, images, tables, and other evidence returned by the API.

### Authentication and API requests

- [`lib/axios.ts`](./lib/axios.ts) is the shared Axios client. It attaches the in-memory access token, attempts one refresh after an eligible `401`, retries the request, and clears local session state if refresh fails.
- Successful login stores the access token in an HttpOnly cookie through the same-origin [`app/api/auth/session/route.ts`](./app/api/auth/session/route.ts). The browser cannot read this cookie.
- [`proxy.ts`](./proxy.ts) checks token expiry to redirect between workspace and auth pages. This is an optimistic user-experience check, not token-signature verification or authorization. The backend must authenticate and authorize every API request.
- Logout calls `/auth/logout` and clears the local session cookie.

The backend should be configured for the frontend origin and credentialed requests where required. The frontend does not provide a replacement for backend authorization or CORS configuration.

## Main dependencies

- Next.js App Router and React
- TanStack Query for server-state fetching and mutations
- Axios for API requests
- React Hook Form and Zod for authentication forms and validation
- Tailwind CSS, shadcn-style UI components, and `next-themes`
- `react-markdown` and `remark-gfm` for chat and citation Markdown
