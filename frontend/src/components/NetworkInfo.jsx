import React from 'react';
import { useBlockNumber, useBalance, useAccount, useChainId } from 'wagmi';
import { polkadotHubTestnet } from '../config/wagmi';

export function NetworkInfo() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: balance } = useBalance({
    address,
  });

  if (!isConnected) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please connect your wallet to see network information</p>
      </div>
    );
  }

  const isCorrectNetwork = chainId === polkadotHubTestnet.id;

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Network Information</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Connected Address:</span>
          <span className="text-sm font-mono">{address?.slice(0, 10)}...{address?.slice(-8)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Chain ID:</span>
          <span className={`font-mono ${isCorrectNetwork ? 'text-green-600' : 'text-red-600'}`}>
            {chainId} {!isCorrectNetwork && '(Wrong Network!)'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Expected Chain ID:</span>
          <span className="font-mono text-blue-600">{polkadotHubTestnet.id}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Network Name:</span>
          <span>{polkadotHubTestnet.name}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Current Block:</span>
          <span>{blockNumber?.toString() || 'Loading...'}</span>
        </div>
        
        {balance && (
          <div className="flex justify-between">
            <span className="font-medium">Balance:</span>
            <span>
              {(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} {balance.symbol}
            </span>
          </div>
        )}
      </div>
      
      {!isCorrectNetwork && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            ⚠️ You're connected to the wrong network. Please switch to Polkadot Hub TestNet in your wallet.
          </p>
          <p className="text-red-600 text-xs mt-1">
            Network Name: {polkadotHubTestnet.name}<br/>
            Chain ID: {polkadotHubTestnet.id}<br/>
            RPC URL: {polkadotHubTestnet.rpcUrls.default.http[0]}
          </p>
        </div>
      )}
    </div>
  );
}