import { useAccount, useReadContract } from 'wagmi';
import { toast } from 'sonner';
import { GraduationCap, Share2, Download, Copy, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress, copyToClipboard, getShareUrl } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StudentPage() {
  const { address, isConnected } = useAccount();

  const { data: credentials, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'getStudentCredentials',
    args: [address],
  });

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
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-slate-600">Please connect your wallet to view your credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <GraduationCap className="h-10 w-10 text-primary-600" />
            <h1 className="text-4xl font-bold">Student Portal</h1>
          </div>
          <p className="text-slate-600">View and share your verified credentials</p>
        </div>

        {isLoading ? (
          <div className="card py-12">
            <LoadingSpinner text="Loading your credentials..." />
          </div>
        ) : credentials && credentials.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {credentials.map((cred, index) => (
              <div
                key={index}
                className={`card ${
                  cred.isRevoked
                    ? 'bg-red-50 border-2 border-red-200'
                    : 'bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">{cred.degree}</h3>
                  {cred.isRevoked ? (
                    <span className="badge-danger flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      Revoked
                    </span>
                  ) : (
                    <span className="badge-success flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Valid
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Credential ID:</span>
                    <span className="font-mono font-semibold">#{cred.tokenId.toString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Student Name:</span>
                    <span className="font-semibold">{cred.studentName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Student ID:</span>
                    <span className="font-semibold">{cred.studentId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">University:</span>
                    <span className="font-semibold">{cred.university}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Major:</span>
                    <span className="font-semibold">{cred.major}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Issue Date:</span>
                    <span className="font-semibold">{cred.issueDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Graduation Date:</span>
                    <span className="font-semibold">{cred.graduationDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Issuer:</span>
                    <span className="font-mono text-xs">{formatAddress(cred.issuer)}</span>
                  </div>
                </div>

                {!cred.isRevoked && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShare(cred.tokenId)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => handleViewOnChain(cred.tokenId)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      <span>View on Chain</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
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
