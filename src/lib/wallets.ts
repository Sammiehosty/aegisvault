export type WalletType = {
  id: string;
  name: string;
  chain: "EVM" | "Bitcoin" | "Solana" | "Multi-chain";
  accent: string; // tailwind-friendly hex for brand dot / glow
  tagline: string;
};

export const WALLET_TYPES: WalletType[] = [
  { id: "metamask", name: "MetaMask", chain: "EVM", accent: "#f6851b", tagline: "Browser & mobile" },
  { id: "coinbase", name: "Coinbase Wallet", chain: "EVM", accent: "#0052ff", tagline: "Smart wallet" },
  { id: "trust", name: "Trust Wallet", chain: "Multi-chain", accent: "#3375bb", tagline: "Mobile first" },
  { id: "ledger", name: "Ledger", chain: "Multi-chain", accent: "#00e0a4", tagline: "Hardware wallet" },
  { id: "trezor", name: "Trezor", chain: "Multi-chain", accent: "#7ac74c", tagline: "Hardware wallet" },
  { id: "phantom", name: "Phantom", chain: "Solana", accent: "#ab9ff2", tagline: "Solana & EVM" },
  { id: "exodus", name: "Exodus", chain: "Multi-chain", accent: "#8b5cf6", tagline: "Desktop & mobile" },
  { id: "rainbow", name: "Rainbow", chain: "EVM", accent: "#ec4899", tagline: "Ethereum native" },
  { id: "binance_web3", name: "Binance Web3 Wallet", chain: "Multi-chain", accent: "#f0b90b", tagline: "Multi-chain wallet" },
  { id: "okx", name: "OKX Wallet", chain: "Multi-chain", accent: "#ffffff", tagline: "Multi-chain wallet" },
  { id: "rabby", name: "Rabby Wallet", chain: "EVM", accent: "#8b5cf6", tagline: "EVM-focused wallet" },
  { id: "safepal", name: "SafePal", chain: "Multi-chain", accent: "#4c8bf5", tagline: "Mobile & hardware" },
  { id: "uniswap", name: "Uniswap Wallet", chain: "EVM", accent: "#ff007a", tagline: "Ethereum & web3" },
  { id: "zerion", name: "Zerion", chain: "Multi-chain", accent: "#7c5cff", tagline: "Multi-chain wallet" },
];

export function getWalletType(id: string) {
  return WALLET_TYPES.find((w) => w.id === id);
}

const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const BTC_RE = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{11,71})$/;
const SOL_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function detectChain(address: string): "EVM" | "Bitcoin" | "Solana" | null {
  if (EVM_RE.test(address)) return "EVM";
  if (BTC_RE.test(address)) return "Bitcoin";
  if (SOL_RE.test(address)) return "Solana";
  return null;
}

export function isValidPublicAddress(address: string) {
  return detectChain(address.trim()) !== null;
}

export function shortAddress(address: string) {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

export const BACKUP_METHODS = [
  {
    id: "steel",
    label: "Steel plate / metal backup",
    description: "Phrase stamped or engraved into fireproof steel",
  },
  {
    id: "paper",
    label: "Paper (offline)",
    description: "Handwritten on archival paper, stored offline",
  },
  {
    id: "hardware",
    label: "Hardware wallet + recovery card",
    description: "Device-secured keys with a physical recovery card",
  },
  {
    id: "shamir",
    label: "Shamir / split backup",
    description: "Secret split across multiple shares & locations",
  },
] as const;

export const BACKUP_CHECKLIST = [
  {
    id: "written",
    label: "Recovery phrase is written down",
    hint: "On paper or steel — never typed into any device",
  },
  {
    id: "two_locations",
    label: "Stored in at least two separate secure locations",
    hint: "Protects against fire, flood and theft at a single site",
  },
  {
    id: "no_digital",
    label: "Zero digital copies exist",
    hint: "No photos, screenshots, cloud drives, email or notes apps",
  },
  {
    id: "pin",
    label: "PIN and passphrase protection enabled",
    hint: "Extra layer in case the device or card is found",
  },
  {
    id: "test_recovery",
    label: "Recovery process has been tested",
    hint: "Verified via test restore or built-in phrase check",
  },
  {
    id: "never_typed",
    label: "Phrase has never been entered on any website",
    hint: "AegisVault will never ask for it — not here, not anywhere",
  },
] as const;
