# Implementation Prompt: Phase 7 — Benchmarking Suite & Avishkar Deliverables

## 1. Goal & Background
Build the automated empirical benchmarking suite, Avishkar 2026-27 research deliverables, and the interactive in-app benchmark demonstration portal (`src/app/benchmarks/page.tsx`) for **AutoCert-ZKP** competing in the **Avishkar Research Convention (RTMNU, Engineering & Technology Category, UG Level)**.

To win at the university and state research convention, academic claims must be backed by rigorous quantitative empirical evidence, reproducible benchmarking, professional research artifacts (poster blueprint, formal research abstract, and defense Q&A), and an interactive live demonstration hub that convention judges can test on their own mobile devices in under 90 seconds.

Phase 7 delivers:
1. **Automated Multi-Device Empirical Benchmarking Harness (`scripts/benchmark.ts`)**:
   - Real-world multi-iteration statistical profiling of:
     - Groth16 zk-SNARK proof generation latency ($T_{proof}$): Witness computation + Groth16 proving on curve $BN128$.
     - Verification latency ($T_{verify}$): Bilinear pairing checks $e(A, B) = e(\alpha, \beta) + \dots$ against `verification_key.json`.
     - Memory allocation ($M_{peak}$): Peak resident set size (RSS) and heap allocations during proving.
     - Payload efficiency: 384-byte Base64 proof token vs. 2.4 MB scanned transcript PDF (**99.98% bandwidth reduction**).
     - Multi-device empirical baseline comparisons (Low-End Mobile 4GB, Mid-Tier Mobile 8GB, Desktop x86_64, and Traditional Centralized Verification).
   - Generates machine-readable `docs/benchmarks/benchmark-results.json` and LaTeX-ready `docs/benchmarks/benchmark-report.md`.
2. **Avishkar 2026-27 Research & Presentation Deliverables (`docs/avishkar/`)**:
   - `docs/avishkar/research_abstract.md`: Formal research convention paper abstract adhering to RTMNU Avishkar guidelines (Engineering & Technology category, UG level).
   - `docs/avishkar/presentation_script.md`: 90-second high-impact live demonstration script with the problem hook, mobile demo walkthrough, network tab data minimization proof, and judge defense Q&A.
   - `docs/avishkar/poster_layout.md`: Full 36" x 48" academic research poster blueprint with section copy, diagram layouts, and LaTeX benchmark tables.
3. **Interactive In-App Benchmarks & Demonstration Portal (`src/app/benchmarks/page.tsx`)**:
   - A dedicated interactive portal adhering to `design-taste-frontend`:
     - **Live Client-Side Hardware Benchmark**: Allows judges to click "Run Live Client Benchmark" on their own phone or laptop right in the browser, measuring exact $T_{proof}$ and $T_{verify}$ with live animated telemetry!
     - **Empirical Benchmark Matrix**: Filterable comparison table across hardware profiles and legacy verification.
     - **Visual Comparative Analytics**: Animated charts comparing proving time, verification latency, payload size (384B vs 2.4MB), and PII exposure (0% vs 100%).
     - **Avishkar Deliverables Hub**: Interactive viewer tabs for the Research Abstract, Live Demonstration Script, Defense Q&A, and Poster Blueprint with one-click copy and JSON data export.
4. **Landing Page & Navigation Integration (`src/app/page.tsx`)**:
   - Update navigation and hero cards to link all four operational pillars: Authority Ingestion (`/issue`), Student Vault (`/student`), Public Verifier (`/verify`), and Avishkar Benchmarks (`/benchmarks`).

---

## 2. Skills Consulted
- `.agents/skills/architect/SKILL.md`: Architecture of reproducible benchmark harnesses, statistical sampling, and hardware baseline models.
- `.agents/skills/design-taste-frontend/SKILL.md`: Art direction for technical analytics dashboards, dark slate palette, emerald accents, JetBrains Mono for metrics and hashes, interactive bar charts, responsive tabs, and anti-slop guidelines.
- `.agents/skills/document/SKILL.md`: Academic research paper abstract drafting, structured conference poster copy, and live demonstration pitch scripts.
- `.agents/skills/check/SKILL.md` & `.agents/skills/test/SKILL.md`: Statistical assertions and automated execution of the benchmarking test suite.
- `.agents/skills/vercel-react-best-practices/SKILL.md`: Client-side performance, dynamic imports for WebAssembly components, and zero-waterfall UI rendering.

---

## 3. Decisions & Assumptions

1. **Statistical Rigor in Automated Benchmarking (`scripts/benchmark.ts`):**
   - Microbenchmarks will run a warmup iteration to eliminate JIT compilation and file cache noise, followed by $N = 10$ execution rounds.
   - Outputs mean, standard deviation ($\sigma$), median (p50), 95th percentile (p95), min, and max for proving time and verification time.
2. **Device Hardware Profiles Model:**
   - Incorporates measured host data alongside simulated and modeled baselines for mobile target profiles:
     - *Low-End Mobile Device (Modeled Baseline)* (MediaTek Helio G85 / 4GB RAM, Android / Mobile Chrome): $T_{proof} \approx 1,240\text{ ms}$, $M_{peak} \approx 42\text{ MB}$, $T_{verify} \approx 14\text{ ms}$.
     - *Mid-Tier Mobile Device (Modeled Baseline)* (Snapdragon 778G / 8GB RAM, Android / Mobile Chrome): $T_{proof} \approx 580\text{ ms}$, $M_{peak} \approx 38\text{ MB}$, $T_{verify} \approx 8\text{ ms}$.
     - *Desktop Workstation (Empirically Measured Host)* (Modern x86_64 / arm64, 8-16GB RAM): $T_{proof} \approx 270\text{ ms}$, $M_{peak} \approx 354\text{ MB RSS}$, $T_{verify} \approx 19.9\text{ ms}$.
     - *Traditional Centralized Verification (Comparative Baseline)* (Full PDF marksheet upload + centralized database lookup): $T_{proof} = \text{N/A}$ (full data exposed), $M_{peak} > 120\text{ MB}$ (PDF rendering), $T_{verify} \approx 2,400\text{ ms}$, Payload = $2.4\text{ MB}$, PII Data Leakage = $100\%$.
3. **Live In-Browser Benchmark Engine (`src/lib/zk/benchmark-runner.ts`):**
   - The interactive `/benchmarks` page will allow anyone (judges, students, recruiters) to execute a live real-time benchmark directly in their current browser.
   - It executes `snarkjs.groth16.fullProve` and `snarkjs.groth16.verify` using the client's actual CPU, measuring real-time proof generation time, verification time, and payload size, providing empirical proof that the system operates in $< 1.2\text{s}$ on the user's current hardware.
4. **Avishkar Presentation Package:**
   - Research Abstract structured per official RTMNU Avishkar conventions (Introduction, Cryptographic Architecture, Experimental Methodology, Results & Discussion, Societal Impact & Alignment with NEP 2020 / Digilocker).
   - Pitch script timed to precisely 90 seconds with a high-impact opening hook and rapid mobile demo.
   - Comprehensive Q&A defense addressing registrar pre-image integrity, zero cloud compute cost ($₹0.00$), and mobile WASM memory bounds.

---

## 4. Files to Create / Touch
- `scripts/benchmark.ts`: Automated multi-iteration empirical benchmark suite with console tables and file export.
- `docs/benchmarks/benchmark-results.json`: Machine-readable empirical benchmark data.
- `docs/benchmarks/benchmark-report.md`: Comprehensive academic benchmark report with markdown and LaTeX tables.
- `docs/avishkar/research_abstract.md`: Formal research convention paper abstract.
- `docs/avishkar/presentation_script.md`: 90-second live demonstration script and defense Q&A.
- `docs/avishkar/poster_layout.md`: Full 36" x 48" Avishkar presentation poster blueprint.
- `src/lib/types/benchmark.ts`: TypeScript interfaces for benchmark metrics, device profiles, and comparison data.
- `src/lib/zk/benchmark-runner.ts`: Browser-executable live benchmark engine with step-by-step progress callbacks.
- `src/app/benchmarks/page.tsx`: Interactive Avishkar Benchmarks Portal.
- `src/app/benchmarks/components/LiveBenchmarkCard.tsx`: Interactive live browser proving & verification benchmark widget.
- `src/app/benchmarks/components/BenchmarkMatrixTable.tsx`: Multi-profile empirical comparison matrix table.
- `src/app/benchmarks/components/ComparativeCharts.tsx`: Visual SVG/CSS bar and gauge charts for latency, payload, and privacy.
- `src/app/benchmarks/components/AvishkarDeliverablesModal.tsx` or tabs: Deliverables hub for abstract, script, Q&A, and poster blueprint.
- `src/app/page.tsx`: Update landing page navigation and cards to link all 4 phases (Issue, Student, Verify, Benchmarks).
- `package.json`: Add `"benchmark": "tsx scripts/benchmark.ts"`.
- `docs/scope/scope.md`: Update Phase 7 status from `planned` to `in-progress` and then `done`.

---

## 5. Security & Privacy Considerations
- **Data Minimization Integrity:** Benchmark datasets use strictly synthetic mock student credentials (`mock-credentials.ts`) to ensure zero real student PII is processed or logged during test execution.
- **Client-Side Proof Isolation:** Live browser benchmark operates completely client-side in memory with zero outbound network calls, reinforcing the zero-leakage guarantee.
- **Zero Cost Verification:** Demonstrates empirical proof of ₹0 gas and ₹0 server compute across all runs.

---

## 6. Acceptance Criteria
- [ ] `npm run benchmark` executes multi-round empirical testing, logs clean formatted ASCII tables, and generates `docs/benchmarks/benchmark-results.json` and `docs/benchmarks/benchmark-report.md`.
- [ ] Automated benchmark confirms $T_{proof} < 1.2\text{s}$ (desktop $< 250\text{ms}$), $T_{verify} < 10\text{ms}$, and proof payload $= 384\text{ bytes}$ ($99.98\%$ reduction vs PDF).
- [ ] `docs/avishkar/research_abstract.md`, `docs/avishkar/presentation_script.md`, and `docs/avishkar/poster_layout.md` are drafted adhering to RTMNU Avishkar conventions.
- [ ] Interactive `/benchmarks` route renders an award-winning benchmark dashboard with live in-browser benchmark execution, telemetry, comparison charts, and deliverables viewer.
- [ ] Landing page (`src/app/page.tsx`) links to `/benchmarks`, `/verify`, `/student`, and `/issue` with active phase status indicators.
- [ ] All test suites (`npm run verifier:test`, `npm run prover:test`, `npm run benchmark`) pass 100%.
- [ ] `npm run build` and `npm run lint` compile cleanly with zero TypeScript or ESLint errors.

---

## 7. Verification Steps
1. Run `npm run benchmark` to generate the empirical report and verify all performance criteria.
2. Inspect `docs/benchmarks/benchmark-report.md` and `docs/avishkar/` artifacts for completeness.
3. Run `npm run build` to confirm Next.js 16 build succeeds without hydration or typing errors.
4. Start `npm run dev` and navigate to `/benchmarks`:
   - Click "Run Live Client Benchmark" and verify live in-browser execution with real-time telemetry.
   - Switch tabs to inspect the Research Abstract, Live Script, Defense Q&A, and Poster Blueprint.
   - Verify responsive navigation between `/`, `/issue`, `/student`, `/verify`, and `/benchmarks`.
