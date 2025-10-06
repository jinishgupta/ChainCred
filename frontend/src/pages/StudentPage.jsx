import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { toast } from 'sonner';
import { GraduationCap, Share2, Download, Copy, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress, copyToClipboard, getShareUrl } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StudentPage() {
  const { address, isConnected } = useAccount();
  const [credentialsWithMetadata, setCredentialsWithMetadata] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  
  const { data: credentials, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'getStudentCredentials',
    args: [address],
  });

  // Function to fetch metadata from IPFS
  const fetchMetadataFromIPFS = async (tokenURI) => {
    try {
      const response = await fetch(`https://${tokenURI}`);
      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  // Fetch metadata for all credentials when credentials change
  useEffect(() => {
    if (credentials && credentials.length > 0) {
      setIsLoadingMetadata(true);
      
      const fetchAllMetadata = async () => {
        const credentialsWithMeta = [];
        
        for (const cred of credentials) {
          let metadata = null;
          
          // Check if credential has tokenURI (new contract structure)
          if (cred.tokenURI) {
            metadata = await fetchMetadataFromIPFS(cred.tokenURI);
          } else {
            // For old contract structure, we can't fetch metadata
            console.log('Credential without tokenURI detected - old contract structure');
          }
          
          credentialsWithMeta.push({
            ...cred,
            metadata
          });
        }
        
        setCredentialsWithMetadata(credentialsWithMeta);
        setIsLoadingMetadata(false);
      };
      
      fetchAllMetadata();
    } else {
      setCredentialsWithMetadata([]);
      setIsLoadingMetadata(false);
    }
  }, [credentials]);

  const handleShare = (tokenId) => {
    const url = getShareUrl(tokenId);
    copyToClipboard(url);
    toast.success('Share link copied to clipboard!');
  };

  const handleViewOnChain = (tokenId) => {
    window.open(`${import.meta.env.VITE_BLOCK_EXPLORER}/#/explorer/query/${CONTRACT_ADDRESS}`, '_blank');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-scale-in">
          <AlertCircle className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-bounce-gentle" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-lg text-slate-600">Please connect your wallet to view your credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-br from-primary-100 to-blue-100 p-4 rounded-2xl shadow-lg animate-float">
              <GraduationCap className="h-12 w-12 text-primary-600" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold gradient-text">Student Portal</h1>
              <p className="text-lg md:text-xl text-slate-600 mt-2">View and share your verified credentials</p>
            </div>
          </div>
        </div>

        {isLoading || isLoadingMetadata ? (
          <div className="card py-16 animate-pulse-gentle">
            <LoadingSpinner text={isLoading ? "Loading your credentials..." : "Fetching credential metadata..."} />
          </div>
        ) : credentialsWithMetadata && credentialsWithMetadata.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {credentialsWithMetadata.map((cred, index) => {
              const metadata = cred.metadata;
              return (
                <div
                  key={index}
                  className={`card group cursor-pointer animate-scale-in stagger-${(index % 5) + 1} ${
                    cred.isRevoked
                      ? 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200'
                      : 'bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 border-2 border-primary-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {metadata?.degree || 'Credential'}
                    </h3>
                    {cred.isRevoked ? (
                      <span className="badge-danger flex items-center text-sm px-3 py-1.5">
                        <XCircle className="h-4 w-4 mr-1" />
                        Revoked
                      </span>
                    ) : (
                      <span className="badge-success flex items-center text-sm px-3 py-1.5">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Valid
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                      <span className="text-slate-600 font-medium">Credential ID:</span>
                      <span className="font-mono font-bold text-primary-600 text-sm">#{cred.tokenId?.toString() || 'N/A'}</span>
                    </div>
                    {metadata && (
                      <>
                        <div className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                          <span className="text-slate-600 font-medium">Student Name:</span>
                          <span className="font-semibold text-slate-900">{metadata.studentName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                          <span className="text-slate-600 font-medium">Student ID:</span>
                          <span className="font-semibold text-slate-900">{metadata.studentId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                          <span className="text-slate-600 font-medium">University:</span>
                          <span className="font-semibold text-slate-900">{metadata.university || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                          <span className="text-slate-600 font-medium">Major:</span>
                          <span className="font-semibold text-slate-900">{metadata.major || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                          <span className="text-slate-600 font-medium">Issue Date:</span>
                          <span className="font-semibold text-slate-900">{metadata.issueDate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                          <span className="text-slate-600 font-medium">Graduation Date:</span>
                          <span className="font-semibold text-slate-900">{metadata.graduationDate || 'N/A'}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                      <span className="text-slate-600 font-medium">Issuer:</span>
                      <span className="font-mono text-xs font-semibold text-slate-900">{formatAddress(cred.issuer)}</span>
                    </div>
                    {!metadata && (
                      <div className="text-sm text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-lg border border-amber-200">
                        <span className="text-base">⚠️</span> {cred.tokenURI ? 'Metadata could not be loaded from IPFS' : 'Metadata not available (old contract structure)'}
                      </div>
                    )}
                  </div>

                  {!cred.isRevoked && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShare(cred.tokenId)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-lg hover:from-primary-700 hover:to-blue-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 group"
                      >
                        <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() => handleViewOnChain(cred.tokenId)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 group"
                      >
                        <Download className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
                        <span>View on Chain</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-16">
            <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Credentials Yet</h3>
            <p className="text-slate-600 mb-6">
              You don't have any credentials issued to this wallet address.
            </p>
            <p className="text-sm text-slate-500">
              Once your university issues a credential, it will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
