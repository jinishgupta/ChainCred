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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Verify Credential</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Enter a credential ID to instantly verify its authenticity and view details.
          </p>
        </div>

        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Credential ID</label>
              <input
                type="number"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="Enter credential ID (e.g., 0, 1, 2...)"
                className="input-field"
                min="0"
              />
              <p className="text-xs text-slate-500 mt-1">
                The credential ID is a unique number assigned when the credential is issued
              </p>
            </div>
            <button type="submit" className="btn-primary w-full">
              <Search className="h-5 w-5 mr-2 inline" />
              Verify Credential
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {hasSearched && verificationResult && (
          <div className="animate-fade-in">
            {verificationResult[0] ? (
              /* Valid Credential */
              <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">Valid Credential</h2>
                    <p className="text-green-700">This credential is authentic and has not been revoked</p>
                  </div>
                </div>

                {/* Credential Details */}
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-bold mb-4 text-slate-900">Credential Details</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-600">Credential ID</span>
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded border mt-1">
                        <span className="font-mono font-semibold">#{verificationResult[1]?.tokenId?.toString() || credentialId}</span>
                        <button
                          onClick={() => handleCopy(verificationResult[1]?.tokenId?.toString() || credentialId)}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Status</span>
                      <div className="bg-green-100 text-green-800 px-3 py-2 rounded border border-green-300 mt-1 font-semibold flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valid & Active
                      </div>
                    </div>
                  </div>

                  {isLoadingMetadata ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-slate-600 mt-2">Loading credential details...</p>
                    </div>
                  ) : metadata ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-slate-600">Student Name</span>
                          <p className="font-semibold text-lg mt-1">{metadata.studentName || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600">Student ID</span>
                          <p className="font-semibold text-lg mt-1">{metadata.studentId || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-slate-600">University</span>
                        <p className="font-semibold text-lg mt-1">{metadata.university || 'N/A'}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-slate-600">Degree</span>
                          <p className="font-semibold text-lg mt-1">{metadata.degree || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600">Major</span>
                          <p className="font-semibold text-lg mt-1">{metadata.major || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-slate-600">Issue Date</span>
                          <p className="font-semibold mt-1">{metadata.issueDate || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600">Graduation Date</span>
                          <p className="font-semibold mt-1">{metadata.graduationDate || 'N/A'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded">
                      ⚠️ {verificationResult[1]?.tokenURI ? 'Metadata could not be loaded from IPFS' : 'Metadata not available (old contract structure)'}
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-slate-600">Issued By (University Wallet)</span>
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded border mt-1">
                      <span className="font-mono text-sm">{formatAddress(verificationResult[1]?.issuer)}</span>
                      <button
                        onClick={() => handleCopy(verificationResult[1]?.issuer)}
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Blockchain Verified</p>
                        <p className="text-xs text-slate-600">
                          This credential is stored on the Polkadot Paseo Testnet and cannot be forged or altered.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Invalid/Revoked Credential */
              <div className="card bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-red-800">Invalid or Revoked</h2>
                    <p className="text-red-700">This credential does not exist or has been revoked</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Possible Reasons:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
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
        <div className="card mt-8 bg-gradient-to-br from-primary-50 to-blue-50">
          <h3 className="text-xl font-semibold mb-4">How Verification Works</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <p>Enter the credential ID provided by the student</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <p>Our system queries the blockchain smart contract</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <p>Get instant verification results with complete credential details</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
              <p>No login required - verification is free and accessible to everyone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
