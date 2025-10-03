import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Define Paseo Testnet
export const paseoTestnet = {
  id: parseInt(import.meta.env.VITE_CHAIN_ID || '42161'),
  name: import.meta.env.VITE_CHAIN_NAME || 'Paseo Testnet',
  network: 'paseo',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || 'https://rpc.ibp.network/paseo'],
    },
    public: {
      http: [import.meta.env.VITE_RPC_URL || 'https://rpc.ibp.network/paseo'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polkadot Explorer',
      url: import.meta.env.VITE_BLOCK_EXPLORER || 'https://polkadot.js.org/apps/',
    },
  },
  testnet: true,
};

export const config = createConfig({
  chains: [paseoTestnet],
  connectors: [
    injected({ 
      target: 'metaMask',
      shimDisconnect: true,
    }),
  ],
  transports: {
    [paseoTestnet.id]: http(),
  },
});

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
export const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || '0x0000000000000000000000000000000000000000';
