import React from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { Wallet, Smartphone, Monitor, QrCode, Info } from 'lucide-react';
import { isMobile, isInWalletBrowser, getWalletConnectionInstructions } from '../utils/helpers';

export function ConnectWallet() {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const connectionInstructions = getWalletConnectionInstructions();

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

  // Helper function to get connector icon
  const getConnectorIcon = (connectorName) => {
    switch (connectorName.toLowerCase()) {
      case 'walletconnect':
        return <QrCode className="h-5 w-5" />;
      case 'metamask':
        return <Wallet className="h-5 w-5" />;
      case 'injected':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  // Helper function to get connector description
  const getConnectorDescription = (connectorName) => {
    switch (connectorName.toLowerCase()) {
      case 'walletconnect':
        return isMobile() ? 'Scan QR code with wallet app' : 'Connect mobile wallet via QR code';
      case 'metamask':
        return isInWalletBrowser() ? 'Connect with current wallet' : 'Connect with MetaMask extension';
      case 'injected':
        return 'Connect with browser wallet';
      default:
        return 'Connect wallet';
    }
  };

  // Sort connectors to prioritize based on device type
  const sortedConnectors = [...connectors].sort((a, b) => {
    if (isInWalletBrowser()) {
      // In wallet browser, prioritize injected/metamask
      if (a.name.toLowerCase().includes('inject') || a.name.toLowerCase().includes('metamask')) return -1;
      if (b.name.toLowerCase().includes('inject') || b.name.toLowerCase().includes('metamask')) return 1;
    } else if (isMobile()) {
      // On mobile, prioritize WalletConnect
      if (a.name.toLowerCase().includes('walletconnect')) return -1;
      if (b.name.toLowerCase().includes('walletconnect')) return 1;
    }
    return 0;
  });

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect Your Wallet</h3>
      
      {/* Connection instructions based on device type */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">{connectionInstructions.title}</h4>
            <p className="text-xs text-blue-700 mt-1">{connectionInstructions.description}</p>
          </div>
        </div>
      </div>

      {sortedConnectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isLoading}
          className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getConnectorIcon(connector.name)}
          <div className="text-left flex-1">
            <div className="font-medium text-gray-800">
              {isLoading && pendingConnector?.uid === connector.uid
                ? 'Connecting...'
                : connector.name}
            </div>
            <div className="text-sm text-gray-500">
              {getConnectorDescription(connector.name)}
            </div>
          </div>
          {isLoading && pendingConnector?.uid === connector.uid && (
            <div className="ml-auto">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </button>
      ))}
      
      {/* Additional mobile-specific instructions */}
      {isMobile() && !isInWalletBrowser() && (
        <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-sm font-medium text-orange-800 mb-2">📱 Mobile Options:</h4>
          <ul className="text-xs text-orange-700 space-y-1">
            <li>• <strong>WalletConnect:</strong> Scan QR code with MetaMask, Trust Wallet, etc.</li>
            <li>• <strong>In-App Browser:</strong> Open this site directly in your wallet app</li>
            <li>• <strong>MetaMask App:</strong> Use the built-in browser in MetaMask mobile</li>
          </ul>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm">
            <strong>Connection Error:</strong> {error.message}
            {isMobile() && (
              <div className="mt-2 text-xs">
                Try opening this site in your wallet's built-in browser instead.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}