# Implementation Prompt: Phase 1 — Stack Foundation & CLI Scaffolding (Next.js 16.4+)

## 1. Goal & Background
Stand up the core web application infrastructure for **AutoCert-ZKP** using the latest **Next.js 16 (16.4+)**, **React 19**, **TypeScript**, and **Tailwind CSS**. All initializations must be executed strictly via terminal commands (`npx`, `npm`) without manually writing any generatable boilerplate or scaffolding.

## 2. Skills Consulted
- `.agents/skills/architect/SKILL.md`: Foundational architecture boundaries.
- `.agents/skills/develop/SKILL.md`: Builder flow and CLI scaffolding rules.
- `.agents/skills/vercel-react-best-practices/SKILL.md`: Web Worker and dynamic import performance patterns.
- `.agents/skills/ai-sdk/SKILL.md`: Vercel AI SDK architecture, structured object generation, and provider setup.
- `.agents/skills/ai-elements/SKILL.md`: Prebuilt UI components for conversational transcript audits.
- `.agents/skills/streamdown/SKILL.md`: Streaming-optimized markdown rendering for AI assistant feedback.
- Bundled Next.js Documentation (`node_modules/next/dist/docs/`): Source of truth for Next.js 16 App Router and async request conventions.

## 3. Decisions & Assumptions
1. **Next.js 16.4+ Strict Enforcement:** Target the latest release (`16.4.2`), not Next.js 15.
2. **Zero Manual Scaffolding:** Run `npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"` directly in the workspace directory.
3. **WebAssembly & Worker Compatibility:** Configure `next.config.ts` with `experiments.asyncWebAssembly = true` to allow streaming `.wasm` circuit binaries.
4. **Vercel AI SDK Layer:** Install `ai`, `@ai-sdk/openai`, and `zod` to enable structured schema extraction via `generateObject` and AI agent workflows using OpenCode Zen `opencode/big-pickle`.
5. **Environment Isolation:** Create `.env.example` defining `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENCODE_ZEN_BASE_URL`, and `OPENCODE_ZEN_API_KEY`.

## 4. Dependencies to Install via Terminal
- **AI Agent & LLM Layer:** `ai`, `@ai-sdk/openai`, `zod`
- **Cryptographic & ZK:** `snarkjs`, `circomlibjs`
- **Database & Ledger:** `@supabase/supabase-js`
- **QR Code Sharing:** `qrcode`
- **UI & Styling:** `lucide-react`, `clsx`, `tailwind-merge`
- **Type Definitions (Dev):** `@types/snarkjs`, `@types/qrcode`

## 5. Security & Privacy Considerations
- No sensitive client data or salts in `.env`.
- Service role keys for Supabase stay strictly on the server; only `anon` key reaches the client.
- `.gitignore` must ignore `.env.local` and temporary compilation artifacts.

## 6. Acceptance Criteria
- [ ] `package.json` reflects `"next": "^16.4.2"` and `"react": "^19.0.0"`.
- [ ] `node_modules/next/dist/docs/` is present and accessible.
- [ ] Vercel AI SDK (`ai`, `@ai-sdk/openai`, `zod`) installed and verified.
- [ ] `next.config.ts` is configured for WebAssembly and Web Worker support.
- [ ] `npm run dev` and `npx tsc --noEmit` pass with zero errors.
- [ ] Directory structure initialized: `circuits/`, `public/zk/`, `workers/`, `lib/`.

## 7. Verification Steps
1. Execute CLI initialization and dependency installation commands.
2. Run `npm list next react ai @ai-sdk/openai zod` to verify versions.
3. Verify that `node_modules/next/dist/docs/` contains bundled guides.
4. Run `npm run build` or start dev server to verify bundle compilation.
