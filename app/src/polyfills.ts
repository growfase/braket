// Solana web3.js and the wallet adapters assume a Node-style `Buffer` global.
// Import this module BEFORE anything Solana-related in main.tsx.
import { Buffer } from "buffer";

if (typeof (globalThis as { Buffer?: unknown }).Buffer === "undefined") {
  (globalThis as { Buffer?: unknown }).Buffer = Buffer;
}
