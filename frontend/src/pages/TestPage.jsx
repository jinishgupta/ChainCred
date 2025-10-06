import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { CONTRACT_ADDRESS, ADMIN_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import { ConnectWallet } from '../components/ConnectWallet';
import { NetworkInfo } from '../components/NetworkInfo';

export default function TestPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('info');
  const [verifyMetadata, setVerifyMetadata] = useState(null);
  const [isLoadingVerifyMetadata, setIsLoadingVerifyMetadata] = useState(false);
  const [currentTxType, setCurrentTxType] = useState(null);
  
  // Form states
  const [universityAddress, setUniversityAddress] = useState('');
  const [credentialForm, setCredentialForm] = useState({
    studentAddress: '',
    studentName: '',
    studentId: '',
    university: '',
    degree: '',
    major: '',
    issueDate: '',
    graduationDate: '',
  });
  const [verifyTokenId, setVerifyTokenId] = useState('');
  const [revokeTokenId, setRevokeTokenId] = useState('');

  // Contract interactions
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read contract data
  const { data: totalCredentials } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'getTotalCredentials',
  });

  const { data: isUniversity } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'isUniversity',
    args: [address],
  });

  const { data: verificationResult, refetch: refetchVerification } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'verifyCredential',
    args: [verifyTokenId],
    query: {
      enabled: false,
    },
  });
  console.log(verificationResult);

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
      setIsLoadingVerifyMetadata(true);
      
      const fetchMetadata = async () => {
        const meta = await fetchMetadataFromIPFS(verificationResult[1].tokenURI);
        setVerifyMetadata(meta);
        setIsLoadingVerifyMetadata(false);
      };
      
      fetchMetadata();
    } else {
      setVerifyMetadata(null);
      setIsLoadingVerifyMetadata(false);
    }
  }, [verificationResult]);

  // Transaction confirmation effects
  useEffect(() => {
    if (isSuccess && currentTxType) {
      switch (currentTxType) {
        case 'addUniversity':
          toast.success('✅ University addition confirmed on blockchain!', {
            description: '🏛️ University has been successfully added to the system.',
          });
          break;
        case 'issueCredential':
          toast.success('✅ Credential issuance confirmed on blockchain!', {
            description: '🎓 Academic credential has been successfully issued.',
          });
          break;
        case 'revokeCredential':
          toast.success('✅ Credential revocation confirmed on blockchain!', {
            description: '🚫 Academic credential has been successfully revoked.',
          });
          break;
      }
      setCurrentTxType(null);
    }
  }, [isSuccess, currentTxType]);

  useEffect(() => {
    if (isConfirming && currentTxType) {
      switch (currentTxType) {
        case 'addUniversity':
          toast.loading('⏳ Confirming university addition...', {
            description: 'Waiting for blockchain confirmation.',
          });
          break;
        case 'issueCredential':
          toast.loading('⏳ Confirming credential issuance...', {
            description: 'Waiting for blockchain confirmation.',
          });
          break;
        case 'revokeCredential':
          toast.loading('⏳ Confirming credential revocation...', {
            description: 'Waiting for blockchain confirmation.',
          });
          break;
      }
    }
  }, [isConfirming, currentTxType]);

  // Functions
  const handleAddUniversity = async () => {
    if (!universityAddress) {
      toast.error('Please enter a university address');
      return;
    }
    try {
      setCurrentTxType('addUniversity');
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'addUniversity',
        args: [universityAddress],
      });
      toast.info('📤 University addition transaction submitted...', {
        description: 'Please wait for blockchain confirmation.',
      });
    } catch (error) {
      setCurrentTxType(null);
      toast.error(`❌ Failed to add university: ${error.message || 'Unknown error'}`);
    }
  };

  const handleIssueCredential = async () => {
    const { studentAddress, studentName, studentId, university, degree, major, issueDate, graduationDate } = credentialForm;
    
    if (!studentAddress || !studentName || !studentId || !degree || !major) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setCurrentTxType('issueCredential');
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'issueCredential',
        args: [studentAddress, studentName, studentId, university, degree, major, issueDate, graduationDate],
      });
      toast.info('📤 Credential issuance transaction submitted...', {
        description: 'Please wait for blockchain confirmation.',
      });
    } catch (error) {
      setCurrentTxType(null);
      toast.error(`❌ Failed to issue credential: ${error.message || 'Unknown error'}`);
    }
  };

  const handleVerifyCredential = async () => {
    if (!verifyTokenId) {
      toast.error('Please enter a credential ID');
      return;
    }
    try {
      setVerifyMetadata(null); // Reset metadata for new search
      setIsLoadingVerifyMetadata(false);
      await refetchVerification();
      toast.success('Credential verification completed');
    } catch (error) {
      toast.error('Failed to verify credential');
    }
  };

  const handleRevokeCredential = async () => {
    if (!revokeTokenId) {
      toast.error('Please enter a credential ID');
      return;
    }
    try {
      setCurrentTxType('revokeCredential');
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'revokeCredential',
        args: [revokeTokenId],
      });
      toast.info('📤 Credential revocation transaction submitted...', {
        description: 'Please wait for blockchain confirmation.',
      });
    } catch (error) {
      setCurrentTxType(null);
      toast.error(`❌ Failed to revoke credential: ${error.message || 'Unknown error'}`);
    }
  };

  const tabs = [
    { id: 'info', label: 'Contract Info' },
    { id: 'network', label: 'Network Debug' },
    { id: 'admin', label: 'Admin Functions' },
    { id: 'issue', label: 'Issue Credential' },
    { id: 'verify', label: 'Verify Credential' },
    { id: 'revoke', label: 'Revoke Credential' },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-scale-in">
          <AlertTriangle className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-bounce-gentle" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-lg text-slate-600 mb-6">
            Please connect your wallet to test the smart contract functions.
          </p>
          <p className="text-base text-slate-500">
            Click "Connect Wallet" in the navigation bar above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-6 py-3 rounded-full text-base font-bold mb-6 shadow-md border-2 border-yellow-300">
            <Shield className="h-5 w-5" />
            <span>Testing Interface for Judges</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 gradient-text">Smart Contract Testing</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            This page allows you to interact directly with the ChainCred smart contract deployed on Paseo Testnet.
          </p>
        </div>

        {/* Contract Info Card */}
        <div className="card mb-10 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-300 animate-scale-in shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gradient-text">
            <Shield className="h-7 w-7 mr-3 text-primary-600" />
            Contract Information
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <span className="text-base font-semibold text-slate-600 mb-2 block">Contract Address:</span>
              <p className="font-mono text-sm bg-white px-4 py-3 rounded-xl border-2 border-slate-200 break-all font-semibold">
                {CONTRACT_ADDRESS}
              </p>
            </div>
            <div>
              <span className="text-base font-semibold text-slate-600 mb-2 block">Network:</span>
              <p className="font-bold text-lg bg-white px-4 py-3 rounded-xl border-2 border-slate-200">Paseo Testnet</p>
            </div>
            <div>
              <span className="text-base font-semibold text-slate-600 mb-2 block">Your Address:</span>
              <p className="font-mono text-sm bg-white px-4 py-3 rounded-xl border-2 border-slate-200 break-all font-semibold">
                {address}
              </p>
            </div>
            <div>
              <span className="text-base font-semibold text-slate-600 mb-2 block">Total Credentials Issued:</span>
              <p className="font-bold text-2xl bg-white px-4 py-3 rounded-xl border-2 border-slate-200">
                {totalCredentials?.toString() || '0'}
              </p>
            </div>
          </div>
          {isUniversity && (
            <div className="mt-6 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl inline-flex items-center font-bold text-base border-2 border-green-300 shadow-md">
              <CheckCircle className="h-5 w-5 mr-2" />
              You have University privileges
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="card animate-scale-in">
          <div className="flex flex-wrap gap-3 mb-8 border-b-2 pb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-bold text-base transition-all transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-md'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">How to Test</h3>
                <div className="space-y-5">
                  <div className="flex items-start space-x-4 bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl transition-all hover:shadow-md">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Add University (Admin Only)</h4>
                      <p className="text-base text-slate-600">Grant university role to an address to issue credentials</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl transition-all hover:shadow-md">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Issue Credential (University Only)</h4>
                      <p className="text-base text-slate-600">Create a new credential NFT for a student</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl transition-all hover:shadow-md">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Verify Credential (Anyone)</h4>
                      <p className="text-base text-slate-600">Check if a credential is valid and view its details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl transition-all hover:shadow-md">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Revoke Credential (Issuer Only)</h4>
                      <p className="text-base text-slate-600">Invalidate a credential that was issued</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 gradient-text">Network & Wallet Debug</h3>
                  <p className="text-base text-slate-600 mb-6">
                    This section helps debug network connection issues and wallet compatibility.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold mb-4">Wallet Connection</h4>
                    <ConnectWallet />
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold mb-4">Network Information</h4>
                    <NetworkInfo />
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
                    <h4 className="text-xl font-bold mb-4 text-blue-900">Troubleshooting</h4>
                    <div className="text-base text-blue-800 space-y-3 leading-relaxed">
                      <p className="font-medium">• If you see "Wrong Network", add Polkadot Hub TestNet to your wallet manually:</p>
                      <div className="bg-white p-4 rounded-lg border-2 border-blue-200 font-mono text-sm">
                        Network Name: Polkadot Hub TestNet<br/>
                        RPC URL: https://testnet-passet-hub-eth-rpc.polkadot.io<br/>
                        Chain ID: 420420422<br/>
                        Currency Symbol: PAS
                      </div>
                      <p className="font-medium">• If transactions fail, ensure you have PAS tokens from the faucet</p>
                      <p className="font-medium">• If MetaMask shows Sepolia, manually switch to Polkadot Hub TestNet</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">Add University</h3>
                  <p className="text-base text-slate-600 mb-6">
                    Grant university role to an address. Only the contract admin can perform this action.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-semibold mb-3">University Address</label>
                      <input
                        type="text"
                        value={universityAddress}
                        onChange={(e) => setUniversityAddress(e.target.value)}
                        placeholder="0x..."
                        className="input-field text-base"
                      />
                    </div>
                    <button
                      onClick={handleAddUniversity}
                      disabled={isPending || isConfirming}
                      className="btn-primary w-full sm:w-auto text-lg py-4 ripple"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                          <span className="font-semibold">{isPending ? 'Submitting...' : 'Confirming...'}</span>
                        </>
                      ) : (
                        <span className="font-semibold">Add University</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'issue' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">Issue New Credential</h3>
                  <p className="text-base text-slate-600 mb-6">
                    Create a new credential for a student. Only addresses with university role can perform this action.
                  </p>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-base font-semibold mb-3">Student Address *</label>
                      <input
                        type="text"
                        value={credentialForm.studentAddress}
                        onChange={(e) => setCredentialForm({ ...credentialForm, studentAddress: e.target.value })}
                        placeholder="0x..."
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold mb-3">Student Name *</label>
                      <input
                        type="text"
                        value={credentialForm.studentName}
                        onChange={(e) => setCredentialForm({ ...credentialForm, studentName: e.target.value })}
                        placeholder="Juan Pérez"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold mb-3">Student ID *</label>
                      <input
                        type="text"
                        value={credentialForm.studentId}
                        onChange={(e) => setCredentialForm({ ...credentialForm, studentId: e.target.value })}
                        placeholder="20231234"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold mb-3">University</label>
                      <input
                        type="text"
                        value={credentialForm.university}
                        onChange={(e) => setCredentialForm({ ...credentialForm, university: e.target.value })}
                        placeholder="Universidad de Buenos Aires"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold mb-3">Degree *</label>
                      <input
                        type="text"
                        value={credentialForm.degree}
                        onChange={(e) => setCredentialForm({ ...credentialForm, degree: e.target.value })}
                        placeholder="Bachelor of Science"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold mb-3">Major *</label>
                      <input
                        type="text"
                        value={credentialForm.major}
                        onChange={(e) => setCredentialForm({ ...credentialForm, major: e.target.value })}
                        placeholder="Computer Science"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold mb-3">Issue Date</label>
                      <input
                        type="date"
                        value={credentialForm.issueDate}
                        onChange={(e) => setCredentialForm({ ...credentialForm, issueDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold mb-3">Graduation Date</label>
                      <input
                        type="date"
                        value={credentialForm.graduationDate}
                        onChange={(e) => setCredentialForm({ ...credentialForm, graduationDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleIssueCredential}
                    disabled={isPending || isConfirming}
                    className="btn-primary w-full mt-6 text-lg py-4 ripple"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                        <span className="font-semibold">{isPending ? 'Submitting...' : 'Confirming...'}</span>
                      </>
                    ) : (
                      <span className="font-semibold">Issue Credential</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'verify' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">Verify Credential</h3>
                  <p className="text-base text-slate-600 mb-6">
                    Check if a credential exists and is valid. Anyone can verify credentials.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-semibold mb-3">Credential ID</label>
                      <input
                        type="number"
                        value={verifyTokenId}
                        onChange={(e) => setVerifyTokenId(e.target.value)}
                        placeholder="0"
                        className="input-field text-base"
                      />
                    </div>
                    <button
                      onClick={handleVerifyCredential}
                      className="btn-primary w-full sm:w-auto text-lg py-4 ripple"
                    >
                      <span className="font-semibold">Verify Credential</span>
                    </button>
                  </div>
                  
                  {verificationResult && (
                    <div className={`mt-8 p-8 rounded-2xl border-2 shadow-lg ${verificationResult[0] ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'}`}>
                      <div className="flex items-center mb-6">
                        {verificationResult[0] ? (
                          <>
                            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                            <h4 className="text-2xl font-bold text-green-800">Valid Credential</h4>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-8 w-8 text-red-600 mr-3" />
                            <h4 className="text-2xl font-bold text-red-800">Invalid or Revoked</h4>
                          </>
                        )}
                      </div>
                      
                      {verificationResult[1] && (
                        <div className="space-y-4 text-base">
                          <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                            <span className="font-bold">Credential ID:</span>
                            <span className="font-mono font-semibold">#{verificationResult[1]?.tokenId?.toString() || verifyTokenId}</span>
                          </div>
                          
                          {isLoadingVerifyMetadata ? (
                            <div className="text-center py-6">
                              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent mx-auto"></div>
                              <p className="text-slate-600 mt-3 text-base font-medium">Loading credential details...</p>
                            </div>
                          ) : verifyMetadata ? (
                            <>
                              <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                                <span className="font-bold">Student Name:</span>
                                <span className="font-semibold">{verifyMetadata.studentName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                                <span className="font-bold">Student ID:</span>
                                <span className="font-semibold">{verifyMetadata.studentId || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                                <span className="font-bold">University:</span>
                                <span className="font-semibold">{verifyMetadata.university || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                                <span className="font-bold">Degree:</span>
                                <span className="font-semibold">{verifyMetadata.degree || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                                <span className="font-bold">Major:</span>
                                <span className="font-semibold">{verifyMetadata.major || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                                <span className="font-bold">Issue Date:</span>
                                <span className="font-semibold">{verifyMetadata.issueDate || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                                <span className="font-bold">Graduation Date:</span>
                                <span className="font-semibold">{verifyMetadata.graduationDate || 'N/A'}</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-base text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border-2 border-amber-200 font-medium">
                              ⚠️ {verificationResult[1]?.tokenURI ? 'Metadata could not be loaded from IPFS' : 'Metadata not available (old contract structure)'}
                            </div>
                          )}
                          
                          <div className="flex justify-between bg-white/60 p-3 rounded-lg">
                            <span className="font-bold">Issuer:</span>
                            <span className="font-mono font-semibold">{formatAddress(verificationResult[1]?.issuer)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'revoke' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">Revoke Credential</h3>
                  <p className="text-base text-slate-600 mb-6">
                    Invalidate a credential. Only the university that issued it can revoke it.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-semibold mb-3">Credential ID</label>
                      <input
                        type="number"
                        value={revokeTokenId}
                        onChange={(e) => setRevokeTokenId(e.target.value)}
                        placeholder="0"
                        className="input-field text-base"
                      />
                    </div>
                    <button
                      onClick={handleRevokeCredential}
                      disabled={isPending || isConfirming}
                      className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-2 animate-spin inline" />
                          <span>{isPending ? 'Submitting...' : 'Confirming...'}</span>
                        </>
                      ) : (
                        'Revoke Credential'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Status */}
        {(isPending || isConfirming || isSuccess) && (
          <div className="card mt-8 animate-scale-in border-2 border-primary-300 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 gradient-text">Transaction Status</h3>
            <div className="space-y-4">
              {isPending && (
                <div className="flex items-center text-yellow-600 bg-yellow-50 p-4 rounded-xl border-2 border-yellow-300">
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  <span className="font-bold text-lg">Waiting for user confirmation...</span>
                </div>
              )}
              {isConfirming && (
                <div className="flex items-center text-blue-600 bg-blue-50 p-4 rounded-xl border-2 border-blue-300">
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  <span className="font-bold text-lg">Waiting for blockchain confirmation...</span>
                </div>
              )}
              {isSuccess && (
                <div className="flex items-center text-green-600 bg-green-50 p-4 rounded-xl border-2 border-green-300">
                  <CheckCircle className="h-6 w-6 mr-3" />
                  <span className="font-bold text-lg">Transaction confirmed!</span>
                </div>
              )}
              {hash && (
                <div className="mt-4 bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl border-2 border-slate-200">
                  <span className="text-base font-bold text-slate-600 block mb-2">Transaction Hash:</span>
                  <p className="font-mono text-sm bg-white px-4 py-3 rounded-lg border-2 border-slate-200 break-all font-semibold">
                    {hash}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
