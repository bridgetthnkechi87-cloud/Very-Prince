/**
 * @file useFreighter.ts
 * @description React hook for Freighter wallet integration.
 *
 * Freighter is the standard browser extension wallet for the Stellar network.
 * This hook abstracts all wallet interactions so that components can simply
 * consume `{ isConnected, publicKey, connect, signTransaction }` without
 * dealing directly with the `@stellar/freighter-api` package.
 *
 * ## Usage
 *
 * ```tsx
 * const { isConnected, publicKey, connect, isLoading } = useFreighter();
 *
 * if (!isConnected) {
 *   return <button onClick={connect}>Connect Freighter</button>;
 * }
 * return <p>Hello, {publicKey}</p>;
 * ```
 *
 * ## Extending
 *
 * To sign a transaction and submit it:
 * ```tsx
 * const { signTransaction } = useFreighter();
 * const signedXdr = await signTransaction(unsignedXdr, { network: "TESTNET" });
 * ```
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import {
  isAllowed,
  setAllowed,
} from "@stellar/freighter-api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FreighterState {
  /** True once the browser extension has been detected and queried. */
  isInitialized: boolean;
  /** True if Freighter extension is installed in the browser. */
  isInstalled: boolean;
  /** True if the user has connected their wallet to this page. */
  isConnected: boolean;
  /** The connected Stellar public key (G...), or null if not connected. */
  publicKey: string | null;
  /** True while a connection request or sign request is in flight. */
  isLoading: boolean;
  /** Last error message, if any. */
  error: string | null;
  /** Initiate a wallet connection request. */
  connect: () => Promise<void>;
  /** Disconnect (clear local state — Freighter has no programmatic logout). */
  disconnect: () => void;
  /**
   * Request Freighter to sign a transaction XDR.
   *
   * @param transactionXdr — Base64-encoded unsigned transaction XDR.
   * @returns Base64-encoded signed transaction XDR.
   */
  signTransaction: (transactionXdr: string) => Promise<string>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the current Freighter wallet state and interaction callbacks.
 * This hook now uses the centralized WalletContext for better state management.
 * 
 * ## State Synchronization
 * The hook synchronizes internal state with the centralized `WalletContext`. 
 * It also handles the detection of the Freighter browser extension on mount
 * and monitors the connection status.
 * 
 * ## Security Notes
 * - The hook does not store secret keys.
 * - All signing operations are delegated to the Freighter extension.
 * - Verification of signed transactions should always be performed on the backend.
 * 
 * ## Implementation Details
 * - Uses `useEffect` to detect the `freighter` object on the `window` scope.
 * - Leverages `@stellar/freighter-api` for communication with the extension.
 * - Provides a unified interface for connection, disconnection, and signing.
 */
export function useFreighter(): FreighterState {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const {
    isConnected,
    publicKey,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    signTransaction: signTx,
  } = useWallet();

  // ── Detect Freighter on mount ─────────────────────────────────────────────

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        // Check if Freighter is installed
        const freighterExists = await (window as any).freighter?.isConnected();
        setIsInstalled(freighterExists !== undefined);

        if (freighterExists) {
          // Check if this site is already allowed without another prompt.
          const allowed = await isAllowed();
          if (!allowed && isConnected) {
            // If we're connected but not allowed, we might need to re-establish permission
            await setAllowed();
          }
        }
      } catch {
        // Freighter not installed — stay in unconnected state.
        setIsInstalled(false);
      } finally {
        setIsInitialized(true);
      }
    };

    void checkFreighter();
  }, [isConnected]);

  // ── Connect ───────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    try {
      if (!isInstalled) {
        throw new Error(
          "Freighter is not installed. Get it at freighter.app"
        );
      }

      // Grant this site permission to read the public key.
      await setAllowed();
      
      // Use the centralized connectWallet function
      await connectWallet();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      // Error handling is now managed by the wallet context
      throw new Error(message);
    }
  }, [isInstalled, connectWallet]);

  // ── Disconnect ────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    // Use the centralized disconnectWallet function
    disconnectWallet();
  }, [disconnectWallet]);

  // ── Sign Transaction ──────────────────────────────────────────────────────

  const signTransaction = useCallback(
    async (transactionXdr: string): Promise<string> => {
      // Use the centralized signTransaction function from wallet context
      return await signTx(transactionXdr);
    },
    [signTx]
  );

  return {
    isInitialized,
    isInstalled,
    isConnected,
    publicKey,
    isLoading,
    error,
    connect,
    disconnect,
    signTransaction,
  };
}
