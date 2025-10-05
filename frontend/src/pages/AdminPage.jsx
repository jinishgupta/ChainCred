import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress } from '../utils/helpers';

export default function AdminPage() {
  const { address, isConnected } = useAccount();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

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
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'approveUniversity',
        args: [universityAddress],
      });
      toast.success('University approval initiated!');
    } catch (error) {
      toast.error(error.message || 'Failed to approve university');
    }
  };

  const handleReject = async (universityAddress) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'rejectUniversity',
        args: [universityAddress],
      });
      toast.success('University rejection initiated!');
    } catch (error) {
      toast.error(error.message || 'Failed to reject university');
    }
  };

  // Refetch on success
  if (isSuccess) {
    setTimeout(() => refetch(), 2000);
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-slate-600">Please connect your wallet to access the admin portal.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            This address does not have administrator privileges.
          </p>
          <p className="text-sm text-slate-500">Your address: {formatAddress(address)}</p>
          <p className="text-sm text-slate-500 mt-2">
            Only the contract deployer can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-10 w-10 text-primary-600" />
            <h1 className="text-4xl font-bold">Admin Portal</h1>
          </div>
          <p className="text-slate-600">
            Manage university registrations and approvals
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Pending University Registrations</h2>
            <button
              onClick={() => refetch()}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Refresh
            </button>
          </div>

          {!pendingUniversities || pendingUniversities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No pending university registrations</p>
              <p className="text-sm text-slate-500 mt-2">
                New registrations will appear here for approval
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUniversities.map((university, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-xl font-semibold">{university.name}</h3>
                        <span className="badge-warning">Pending</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Country</p>
                          <p className="font-medium">{university.country}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Registration Number</p>
                          <p className="font-medium">{university.registrationNumber}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Wallet Address</p>
                          <p className="font-medium font-mono text-xs">
                            {formatAddress(university.universityAddress)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Submitted</p>
                          <p className="font-medium">
                            {new Date(Number(university.registrationTimestamp) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApprove(university.universityAddress)}
                        disabled={isPending || isConfirming}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isPending || isConfirming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleReject(university.universityAddress)}
                        disabled={isPending || isConfirming}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isPending || isConfirming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Admin Responsibilities</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Review university registration details carefully</li>
            <li>• Verify the authenticity of the university and registration number</li>
            <li>• Approve only legitimate educational institutions</li>
            <li>• Approved universities will be able to issue verifiable credentials</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
