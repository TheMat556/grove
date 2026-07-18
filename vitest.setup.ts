import { vi } from "vitest";

// server-only throws in test environments (not a Next.js server context).
// The guard is only relevant at build time — safe to disable in tests.
vi.mock("server-only", () => ({}));

import "@testing-library/jest-dom/vitest";
