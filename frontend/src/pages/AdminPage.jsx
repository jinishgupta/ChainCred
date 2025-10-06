import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress } from '../utils/helpers';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [currentTxType, setCurrentTxType] = useState(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Transaction confirmation effects
  useEffect(() => {
    if (isSuccess && currentTxType) {
      switch (currentTxType) {
        case 'approve':
          toast.success('✅ University approval confirmed on blockchain!', {
            description: '🎉 University has been successfully approved and can now issue credentials.',
          });
          break;
        case 'reject':
          toast.success('✅ University rejection confirmed on blockchain!', {
            description: '🚫 University application has been rejected.',
          });
          break;
      }
      setCurrentTxType(null);
      setTimeout(() => refetch(), 2000);
    }
  }, [isSuccess, currentTxType]);

  useEffect(() => {
    if (isConfirming && currentTxType) {
      switch (currentTxType) {
        case 'approve':
          toast.loading('⏳ Confirming university approval...', {
            description: 'Waiting for blockchain confirmation.',
          });
          break;
        case 'reject':
          toast.loading('⏳ Confirming university rejection...', {
            description: 'Waiting for blockchain confirmation.',
          });
          break;
      }
    }
  }, [isConfirming, currentTxType]);

  // Check if current address is admin
  const { data: isAdmin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'hasRole',
    args: [
      '0x0000000000000000000000000000000000000000000000000000000000000000', // DEFAULT_ADMIN_ROLE
      address,
    ],
  });

  // Get pending universities
  const { data: pendingUniversities, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'getPendingUniversitiesInfo',
  });

  const handleApprove = async (universityAddress) => {
    try {
      console.log(universityAddress);
      setCurrentTxType('approve');
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'approveUniversity',
        args: [universityAddress],
      });
      toast.info('📤 University approval transaction submitted...', {
        description: 'Please wait for blockchain confirmation.',
      });
    } catch (error) {
      setCurrentTxType(null);
      toast.error(`❌ Failed to approve university: ${error.message || 'Unknown error'}`);
    }
  };

  const handleReject = async (universityAddress) => {
    try {
      setCurrentTxType('reject');
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'rejectUniversity',
        args: [universityAddress],
      });
      toast.info('📤 University rejection transaction submitted...', {
        description: 'Please wait for blockchain confirmation.',
      });
    } catch (error) {
      setCurrentTxType(null);
      toast.error(`❌ Failed to reject university: ${error.message || 'Unknown error'}`);
    }
  };

  // Removed automatic refetch - now handled by useEffect

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-scale-in">
          <AlertCircle className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-bounce-gentle" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-lg text-slate-600">Please connect your wallet to access the admin portal.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-scale-in">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6 animate-bounce-gentle" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Access Denied</h2>
          <p className="text-lg text-slate-600 mb-6">
            This address does not have administrator privileges.
          </p>
          <p className="text-base text-slate-500">Your address: {formatAddress(address)}</p>
          <p className="text-base text-slate-500 mt-3">
            Only the contract deployer can access this page.
          </p>
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
              <Shield className="h-12 w-12 text-primary-600" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold gradient-text">Admin Portal</h1>
              <p className="text-lg md:text-xl text-slate-600 mt-2">
                Manage university registrations and approvals
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-8 animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">Pending University Registrations</h2>
            <button
              onClick={() => refetch()}
              className="text-base text-primary-600 hover:text-primary-700 font-bold transition-all transform hover:scale-105 px-4 py-2 rounded-lg hover:bg-primary-50"
            >
              Refresh
            </button>
          </div>

          {!pendingUniversities || pendingUniversities.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="h-20 w-20 text-slate-300 mx-auto mb-6" />
              <p className="text-xl text-slate-600 font-semibold">No pending university registrations</p>
              <p className="text-base text-slate-500 mt-3">
                New registrations will appear here for approval
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingUniversities.map((university, index) => (
                <div
                  key={index}
                  className="border-2 border-slate-200 rounded-2xl p-8 hover:border-primary-400 transition-all hover:shadow-lg animate-scale-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-5">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{university.name}</h3>
                        <span className="badge-warning text-base px-4 py-2">Pending</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-5 text-base">
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl">
                          <p className="text-slate-600 font-semibold mb-1">Country</p>
                          <p className="font-bold text-lg text-slate-900">{university.country}</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl">
                          <p className="text-slate-600 font-semibold mb-1">Registration Number</p>
                          <p className="font-bold text-lg text-slate-900">{university.registrationNumber}</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl">
                          <p className="text-slate-600 font-semibold mb-1">Wallet Address</p>
                          <p className="font-mono text-base font-semibold text-slate-900">
                            {formatAddress(university.universityAddress)}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl">
                          <p className="text-slate-600 font-semibold mb-1">Submitted</p>
                          <p className="font-bold text-lg text-slate-900">
                            {new Date(Number(university.registrationTimestamp) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 ml-6">
                      <button
                        onClick={() => handleApprove(university.universityAddress)}
                        disabled={isPending || isConfirming}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl hover:from-green-200 hover:to-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-all transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-green-300"
                      >
                        {isPending || isConfirming ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleReject(university.universityAddress)}
                        disabled={isPending || isConfirming}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-xl hover:from-red-200 hover:to-rose-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-all transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-red-300"
                      >
                        {isPending || isConfirming ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-8 animate-fade-in">
          <h3 className="text-2xl font-bold text-blue-900 mb-5">Admin Responsibilities</h3>
          <ul className="text-base text-blue-800 space-y-3 leading-relaxed">
            <li className="flex items-start"><span className="text-xl mr-3">•</span><span className="font-medium">Review university registration details carefully</span></li>
            <li className="flex items-start"><span className="text-xl mr-3">•</span><span className="font-medium">Verify the authenticity of the university and registration number</span></li>
            <li className="flex items-start"><span className="text-xl mr-3">•</span><span className="font-medium">Approve only legitimate educational institutions</span></li>
            <li className="flex items-start"><span className="text-xl mr-3">•</span><span className="font-medium">Approved universities will be able to issue verifiable credentials</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
