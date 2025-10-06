import { http, createConfig } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

// Configure the Polkadot Hub TestNet chain
export const polkadotHubTestnet = {
  id: parseInt(import.meta.env.VITE_CHAIN_ID || '420420422'),
  name: import.meta.env.VITE_CHAIN_NAME || 'Polkadot Hub TestNet',
  network: 'polkadot-hub-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || 'https://testnet-passet-hub-eth-rpc.polkadot.io'],
    },
    public: {
      http: [import.meta.env.VITE_RPC_URL || 'https://testnet-passet-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polkadot Hub Explorer',
      url: import.meta.env.VITE_BLOCK_EXPLORER || 'https://blockscout-passet-hub.parity-testnet.parity.io/',
    },
  },
  testnet: true,
};

// Create Wagmi config
export const config = createConfig({
  chains: [polkadotHubTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
      target: 'metaMask',
    }),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'b57ab6f068620c67a1b07b2c5c0e6bc8',
      metadata: {
        name: 'ChainCred',
        description: 'Blockchain-based credential verification system for Latin America',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://chaincred.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '9999',
        },
      },
    }),
  ],
  transports: {
    [polkadotHubTestnet.id]: http(),
  },
});

// Contract configuration
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0255AfC26cf2b8Fd343C22e620dC806bF4Baef95';
export const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || '0x8E1ffdbbe8770F4f82dD14915Cd68285516C1c05';