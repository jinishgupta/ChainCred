import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Shield, Wallet, LogOut, Menu, X, Smartphone, Monitor } from 'lucide-react';
import { formatAddress } from '../utils/helpers';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const walletOptionsRef = useRef(null);

  // Close wallet options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletOptionsRef.current && !walletOptionsRef.current.contains(event.target)) {
        setShowWalletOptions(false);
      }
    };

    if (showWalletOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showWalletOptions]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'University', href: '/university' },
    { name: 'Student', href: '/student' },
    { name: 'Verify', href: '/verify' },
    { name: 'Admin', href: '/admin' },
    { name: 'Test', href: '/test', highlight: true },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleConnect = (connector) => {
    connect({ connector });
    setShowWalletOptions(false);
  };

  const getConnectorIcon = (connectorId) => {
    if (connectorId === 'injected' || connectorId === 'metaMaskSDK') {
      return <Monitor className="h-5 w-5" />;
    }
    if (connectorId === 'walletConnect') {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Wallet className="h-5 w-5" />;
  };

  const getConnectorLabel = (connector) => {
    if (connector.id === 'injected' || connector.id === 'metaMaskSDK') {
      return 'MetaMask (Browser)';
    }
    if (connector.id === 'walletConnect') {
      return 'WalletConnect (Mobile)';
    }
    return connector.name;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-slate-200/50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <Shield className="h-10 w-10 text-primary-600 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-purple-700 transition-all duration-300">
                ChainCred
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-md'
                    : item.highlight
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 hover:from-yellow-200 hover:to-orange-200 shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:shadow-sm'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center relative" ref={walletOptionsRef}>
            {isConnected ? (
              <div className="flex items-center space-x-3 animate-fade-in">
                <div className="px-5 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl text-base font-semibold flex items-center space-x-2 shadow-sm border border-green-200 animate-pulse-gentle">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{formatAddress(address)}</span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
                  title="Disconnect"
                >
                  <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowWalletOptions(!showWalletOptions)}
                  className="btn-primary flex items-center space-x-2 text-base"
                >
                  <Wallet className="h-5 w-5" />
                  <span className="font-semibold">Connect Wallet</span>
                </button>
                
                {showWalletOptions && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 py-2 z-50 animate-scale-in">
                    <div className="px-5 py-3 border-b border-slate-200">
                      <p className="text-base font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">Choose Connection Method</p>
                    </div>
                    {connectors.map((connector, index) => (
                      <button
                        key={connector.id}
                        onClick={() => handleConnect(connector)}
                        className={`w-full px-5 py-4 flex items-center space-x-3 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 text-left transform hover:scale-105 rounded-xl mx-2 my-1 animate-slide-in stagger-${index + 1}`}
                      >
                        <div className="flex-shrink-0">
                          {getConnectorIcon(connector.id)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-slate-900">
                            {getConnectorLabel(connector)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {connector.id === 'walletConnect' 
                              ? 'Scan QR with mobile wallet' 
                              : 'Use browser extension'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-600 text-white'
                    : item.highlight
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="pt-3 border-t border-slate-200">
              {isConnected ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{formatAddress(address)}</span>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Connect Wallet</p>
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => {
                        handleConnect(connector);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                    >
                      <div className="flex-shrink-0">
                        {getConnectorIcon(connector.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {getConnectorLabel(connector)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {connector.id === 'walletConnect' 
                            ? 'Scan QR with mobile wallet' 
                            : 'Use browser extension'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
