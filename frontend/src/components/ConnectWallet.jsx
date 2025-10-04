import React from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';

export function ConnectWallet() {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button 
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isLoading && pendingConnector?.uid === connector.uid
            ? 'Connecting...'
            : `Connect ${connector.name}`}
        </button>
      ))}
      {error && (
        <div className="text-red-500 text-sm">
          {error.message}
        </div>
      )}
    </div>
  );
}