import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { CONTRACT_ADDRESS, ADMIN_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TestPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('info');
  
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

  // Functions
  const handleAddUniversity = async () => {
    if (!universityAddress) {
      toast.error('Please enter a university address');
      return;
    }
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'addUniversity',
        args: [universityAddress],
      });
      toast.success('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      toast.error(error.message || 'Failed to add university');
    }
  };

  const handleIssueCredential = async () => {
    const { studentAddress, studentName, studentId, university, degree, major, issueDate, graduationDate } = credentialForm;
    
    if (!studentAddress || !studentName || !studentId || !degree || !major) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'issueCredential',
        args: [studentAddress, studentName, studentId, university, degree, major, issueDate, graduationDate],
      });
      toast.success('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      toast.error(error.message || 'Failed to issue credential');
    }
  };

  const handleVerifyCredential = async () => {
    if (!verifyTokenId) {
      toast.error('Please enter a credential ID');
      return;
    }
    try {
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
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'revokeCredential',
        args: [revokeTokenId],
      });
      toast.success('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      toast.error(error.message || 'Failed to revoke credential');
    }
  };

  const tabs = [
    { id: 'info', label: 'Contract Info' },
    { id: 'admin', label: 'Admin Functions' },
    { id: 'issue', label: 'Issue Credential' },
    { id: 'verify', label: 'Verify Credential' },
    { id: 'revoke', label: 'Revoke Credential' },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-slate-600 mb-6">
            Please connect your wallet to test the smart contract functions.
          </p>
          <p className="text-sm text-slate-500">
            Click "Connect Wallet" in the navigation bar above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Shield className="h-4 w-4" />
            <span>Testing Interface for Judges</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Smart Contract Testing</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            This page allows you to interact directly with the ChainCred smart contract deployed on Paseo Testnet.
          </p>
        </div>

        {/* Contract Info Card */}
        <div className="card mb-8 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary-600" />
            Contract Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-slate-600">Contract Address:</span>
              <p className="font-mono text-sm bg-white px-3 py-2 rounded border break-all">
                {CONTRACT_ADDRESS}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Network:</span>
              <p className="font-semibold bg-white px-3 py-2 rounded border">Paseo Testnet</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Your Address:</span>
              <p className="font-mono text-sm bg-white px-3 py-2 rounded border break-all">
                {address}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Total Credentials Issued:</span>
              <p className="font-semibold bg-white px-3 py-2 rounded border">
                {totalCredentials?.toString() || '0'}
              </p>
            </div>
          </div>
          {isUniversity && (
            <div className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-lg inline-flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              You have University privileges
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">How to Test</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Add University (Admin Only)</h4>
                      <p className="text-sm text-slate-600">Grant university role to an address to issue credentials</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Issue Credential (University Only)</h4>
                      <p className="text-sm text-slate-600">Create a new credential NFT for a student</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Verify Credential (Anyone)</h4>
                      <p className="text-sm text-slate-600">Check if a credential is valid and view its details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Revoke Credential (Issuer Only)</h4>
                      <p className="text-sm text-slate-600">Invalidate a credential that was issued</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Add University</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Grant university role to an address. Only the contract admin can perform this action.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">University Address</label>
                      <input
                        type="text"
                        value={universityAddress}
                        onChange={(e) => setUniversityAddress(e.target.value)}
                        placeholder="0x..."
                        className="input-field"
                      />
                    </div>
                    <button
                      onClick={handleAddUniversity}
                      disabled={isPending || isConfirming}
                      className="btn-primary w-full sm:w-auto"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {isPending ? 'Submitting...' : 'Confirming...'}
                        </>
                      ) : (
                        'Add University'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'issue' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Issue New Credential</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Create a new credential for a student. Only addresses with university role can perform this action.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Student Address *</label>
                      <input
                        type="text"
                        value={credentialForm.studentAddress}
                        onChange={(e) => setCredentialForm({ ...credentialForm, studentAddress: e.target.value })}
                        placeholder="0x..."
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Student Name *</label>
                      <input
                        type="text"
                        value={credentialForm.studentName}
                        onChange={(e) => setCredentialForm({ ...credentialForm, studentName: e.target.value })}
                        placeholder="Juan Pérez"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Student ID *</label>
                      <input
                        type="text"
                        value={credentialForm.studentId}
                        onChange={(e) => setCredentialForm({ ...credentialForm, studentId: e.target.value })}
                        placeholder="20231234"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">University</label>
                      <input
                        type="text"
                        value={credentialForm.university}
                        onChange={(e) => setCredentialForm({ ...credentialForm, university: e.target.value })}
                        placeholder="Universidad de Buenos Aires"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Degree *</label>
                      <input
                        type="text"
                        value={credentialForm.degree}
                        onChange={(e) => setCredentialForm({ ...credentialForm, degree: e.target.value })}
                        placeholder="Bachelor of Science"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Major *</label>
                      <input
                        type="text"
                        value={credentialForm.major}
                        onChange={(e) => setCredentialForm({ ...credentialForm, major: e.target.value })}
                        placeholder="Computer Science"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Issue Date</label>
                      <input
                        type="date"
                        value={credentialForm.issueDate}
                        onChange={(e) => setCredentialForm({ ...credentialForm, issueDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Graduation Date</label>
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
                    className="btn-primary w-full mt-4"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {isPending ? 'Submitting...' : 'Confirming...'}
                      </>
                    ) : (
                      'Issue Credential'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'verify' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Verify Credential</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Check if a credential exists and is valid. Anyone can verify credentials.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Credential ID</label>
                      <input
                        type="number"
                        value={verifyTokenId}
                        onChange={(e) => setVerifyTokenId(e.target.value)}
                        placeholder="0"
                        className="input-field"
                      />
                    </div>
                    <button
                      onClick={handleVerifyCredential}
                      className="btn-primary w-full sm:w-auto"
                    >
                      Verify Credential
                    </button>
                  </div>
                  
                  {verificationResult && (
                    <div className={`mt-6 p-6 rounded-lg border-2 ${verificationResult[0] ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                      <div className="flex items-center mb-4">
                        {verificationResult[0] ? (
                          <>
                            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                            <h4 className="text-lg font-bold text-green-800">Valid Credential</h4>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-6 w-6 text-red-600 mr-2" />
                            <h4 className="text-lg font-bold text-red-800">Invalid or Revoked</h4>
                          </>
                        )}
                      </div>
                      {verificationResult[1] && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Student Name:</span>
                            <span>{verificationResult[1].studentName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Student ID:</span>
                            <span>{verificationResult[1].studentId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">University:</span>
                            <span>{verificationResult[1].university}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Degree:</span>
                            <span>{verificationResult[1].degree}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Major:</span>
                            <span>{verificationResult[1].major}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Issuer:</span>
                            <span className="font-mono">{formatAddress(verificationResult[1].issuer)}</span>
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
                  <h3 className="text-xl font-semibold mb-2">Revoke Credential</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Invalidate a credential. Only the university that issued it can revoke it.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Credential ID</label>
                      <input
                        type="number"
                        value={revokeTokenId}
                        onChange={(e) => setRevokeTokenId(e.target.value)}
                        placeholder="0"
                        className="input-field"
                      />
                    </div>
                    <button
                      onClick={handleRevokeCredential}
                      disabled={isPending || isConfirming}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {isPending ? 'Submitting...' : 'Confirming...'}
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
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Transaction Status</h3>
            <div className="space-y-2">
              {isPending && (
                <div className="flex items-center text-yellow-600">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span>Waiting for user confirmation...</span>
                </div>
              )}
              {isConfirming && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span>Waiting for blockchain confirmation...</span>
                </div>
              )}
              {isSuccess && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Transaction confirmed!</span>
                </div>
              )}
              {hash && (
                <div className="mt-2">
                  <span className="text-sm text-slate-600">Transaction Hash:</span>
                  <p className="font-mono text-xs bg-slate-100 px-3 py-2 rounded break-all">
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
