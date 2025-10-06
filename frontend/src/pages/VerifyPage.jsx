import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Search, CheckCircle, XCircle, Shield, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress, copyToClipboard } from '../utils/helpers';

export default function VerifyPage() {
  const { id } = useParams();
  const [credentialId, setCredentialId] = useState(id || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const { data: verificationResult, refetch: refetchVerification } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'verifyCredential',
    args: [credentialId],
    query: {
      enabled: false,
    },
  });

  // Function to fetch metadata from IPFS
  const fetchMetadataFromIPFS = async (tokenURI) => {
    try {
      // Handle both full URLs and partial URLs
      const url = tokenURI.startsWith('http') ? tokenURI : `https://${tokenURI}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  // Fetch metadata when verification result changes
  useEffect(() => {
    if (verificationResult && verificationResult[1] && verificationResult[1].tokenURI) {
      setIsLoadingMetadata(true);
      
      const fetchMetadata = async () => {
        const meta = await fetchMetadataFromIPFS(verificationResult[1].tokenURI);
        setMetadata(meta);
        setIsLoadingMetadata(false);
      };
      
      fetchMetadata();
    } else {
      setMetadata(null);
      setIsLoadingMetadata(false);
    }
  }, [verificationResult]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!credentialId) {
      toast.error('Please enter a credential ID');
      return;
    }
    setHasSearched(true);
    setMetadata(null); // Reset metadata for new search
    setIsLoadingMetadata(false);
    await refetchVerification();
  };

  const handleCopy = (text) => {
    copyToClipboard(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 rounded-2xl mb-6 shadow-lg animate-float">
            <Search className="h-10 w-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 gradient-text">Verify Credential</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Enter a credential ID to instantly verify its authenticity and view details.
          </p>
        </div>

        {/* Search Form */}
        <div className="card mb-8 animate-scale-in">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-3">Credential ID</label>
              <input
                type="number"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="Enter credential ID (e.g., 0, 1, 2...)"
                className="input-field text-lg"
                min="0"
              />
              <p className="text-sm text-slate-500 mt-2">
                The credential ID is a unique number assigned when the credential is issued
              </p>
            </div>
            <button type="submit" className="btn-primary w-full text-lg py-4 ripple">
              <Search className="h-6 w-6 mr-2 inline" />
              <span className="font-semibold">Verify Credential</span>
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {hasSearched && verificationResult && (
          <div className="animate-fade-in">
            {verificationResult[0] ? (
              /* Valid Credential */
              <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 animate-scale-in">
                <div className="flex items-center mb-8">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mr-5 shadow-lg animate-bounce-gentle">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">Valid Credential</h2>
                    <p className="text-lg text-green-700">This credential is authentic and has not been revoked</p>
                  </div>
                </div>

                {/* Credential Details */}
                <div className="bg-white rounded-2xl p-8 space-y-6 shadow-md">
                  <div className="border-b pb-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Credential Details</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <span className="text-base font-semibold text-slate-600">Credential ID</span>
                      <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 rounded-xl border-2 border-slate-200 mt-2">
                        <span className="font-mono font-bold text-lg">#{verificationResult[1]?.tokenId?.toString() || credentialId}</span>
                        <button
                          onClick={() => handleCopy(verificationResult[1]?.tokenId?.toString() || credentialId)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-all transform hover:scale-110"
                        >
                          <Copy className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-slate-600">Status</span>
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-3 rounded-xl border-2 border-green-300 mt-2 font-bold text-lg flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Valid & Active
                      </div>
                    </div>
                  </div>

                  {isLoadingMetadata ? (
                    <div className="text-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
                      <p className="text-lg text-slate-600 mt-4 font-medium">Loading credential details...</p>
                    </div>
                  ) : metadata ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                          <span className="text-base font-semibold text-slate-600">Student Name</span>
                          <p className="font-bold text-xl mt-2 text-slate-900">{metadata.studentName || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                          <span className="text-base font-semibold text-slate-600">Student ID</span>
                          <p className="font-bold text-xl mt-2 text-slate-900">{metadata.studentId || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                        <span className="text-base font-semibold text-slate-600">University</span>
                        <p className="font-bold text-xl mt-2 text-slate-900">{metadata.university || 'N/A'}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                          <span className="text-base font-semibold text-slate-600">Degree</span>
                          <p className="font-bold text-xl mt-2 text-slate-900">{metadata.degree || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                          <span className="text-base font-semibold text-slate-600">Major</span>
                          <p className="font-bold text-xl mt-2 text-slate-900">{metadata.major || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                          <span className="text-base font-semibold text-slate-600">Issue Date</span>
                          <p className="font-bold text-lg mt-2 text-slate-900">{metadata.issueDate || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                          <span className="text-base font-semibold text-slate-600">Graduation Date</span>
                          <p className="font-bold text-lg mt-2 text-slate-900">{metadata.graduationDate || 'N/A'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-base text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border-2 border-amber-200 font-medium">
                      ⚠️ {verificationResult[1]?.tokenURI ? 'Metadata could not be loaded from IPFS' : 'Metadata not available (old contract structure)'}
                    </div>
                  )}

                  <div>
                    <span className="text-base font-semibold text-slate-600">Issued By (University Wallet)</span>
                    <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 rounded-xl border-2 border-slate-200 mt-2">
                      <span className="font-mono text-base font-semibold">{formatAddress(verificationResult[1]?.issuer)}</span>
                      <button
                        onClick={() => handleCopy(verificationResult[1]?.issuer)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-all transform hover:scale-110"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t-2">
                    <div className="flex items-start space-x-3 bg-gradient-to-r from-primary-50 to-blue-50 p-5 rounded-xl">
                      <Shield className="h-7 w-7 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-lg font-bold text-slate-900 mb-1">Blockchain Verified</p>
                        <p className="text-base text-slate-600 leading-relaxed">
                          This credential is stored on the Polkadot Paseo Testnet and cannot be forged or altered.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Invalid/Revoked Credential */
              <div className="card bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 animate-scale-in">
                <div className="flex items-center mb-8">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mr-5 shadow-lg animate-bounce-gentle">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-red-800 mb-2">Invalid or Revoked</h2>
                    <p className="text-lg text-red-700">This credential does not exist or has been revoked</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">Possible Reasons:</h3>
                  <ul className="list-disc list-inside space-y-2 text-base text-slate-700 leading-relaxed">
                    <li>The credential ID does not exist</li>
                    <li>The credential has been revoked by the issuing university</li>
                    <li>The credential was never issued</li>
                    <li>Invalid credential ID format</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="card mt-10 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 animate-fade-in">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">How Verification Works</h3>
          <div className="space-y-5 text-base text-slate-700">
            <div className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl transition-all hover:bg-white/80">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                1
              </div>
              <p className="font-medium leading-relaxed">Enter the credential ID provided by the student</p>
            </div>
            <div className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl transition-all hover:bg-white/80">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                2
              </div>
              <p className="font-medium leading-relaxed">Our system queries the blockchain smart contract</p>
            </div>
            <div className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl transition-all hover:bg-white/80">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                3
              </div>
              <p className="font-medium leading-relaxed">Get instant verification results with complete credential details</p>
            </div>
            <div className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl transition-all hover:bg-white/80">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                4
              </div>
              <p className="font-medium leading-relaxed">No login required - verification is free and accessible to everyone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
