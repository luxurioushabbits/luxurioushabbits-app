/**
 * Web3 wallet configuration — Luxurious Habbits
 * Uses Reown AppKit (formerly WalletConnect) + wagmi for wallet connectivity.
 * Supports MetaMask, WalletConnect, Coinbase Wallet, and more.
 */
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet } from "@reown/appkit/networks";

// WalletConnect Project ID — get one free at cloud.reown.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "demo";

// Wagmi adapter — handles wallet connections
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet],
});

// AppKit modal — the connect wallet UI
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet],
  defaultNetwork: mainnet,
  metadata: {
    name: "Luxurious Habbits",
    description: "Premium Hemp — Luxurious Habbits",
    url: typeof window !== "undefined" ? window.location.origin : "https://luxurioushabbits.com",
    icons: ["/favicon.ico"],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#bf5fff",
    "--w3m-border-radius-master": "4px",
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
