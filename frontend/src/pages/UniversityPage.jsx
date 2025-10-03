import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { University, Plus, List, Loader2, AlertCircle } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress, formatDate, DEGREE_TYPES, MAJOR_FIELDS } from '../utils/helpers';

export default function UniversityPage() {
  const { address, isConnected } = useAccount();
  const [activeView, setActiveView] = useState('issue');
  
  const [formData, setFormData] = useState({
    studentAddress: '',
    studentName: '',
    studentId: '',
    university: 'Universidad de Buenos Aires',
    degree: '',
    major: '',
    issueDate: new Date().toISOString().split('T')[0],
    graduationDate: new Date().toISOString().split('T')[0],
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: isUniversity } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'isUniversity',
    args: [address],
  });

  const { data: credentials, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'getUniversityCredentials',
    args: [address],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentAddress || !formData.studentName || !formData.studentId || !formData.degree || !formData.major) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'issueCredential',
        args: [
          formData.studentAddress,
          formData.studentName,
          formData.studentId,
          formData.university,
          formData.degree,
          formData.major,
          formData.issueDate,
          formData.graduationDate,
        ],
      });
      toast.success('Credential issuance initiated!');
    } catch (error) {
      toast.error(error.message || 'Failed to issue credential');
    }
  };

  const handleRevoke = async (tokenId) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'revokeCredential',
        args: [tokenId],
      });
      toast.success('Credential revocation initiated!');
    } catch (error) {
      toast.error(error.message || 'Failed to revoke credential');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-slate-600">Please connect your wallet to access the university portal.</p>
        </div>
      </div>
    );
  }

  if (!isUniversity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            This address does not have university privileges. Contact the admin to get access.
          </p>
          <p className="text-sm text-slate-500">Your address: {formatAddress(address)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <University className="h-10 w-10 text-primary-600" />
            <h1 className="text-4xl font-bold">University Portal</h1>
          </div>
          <p className="text-slate-600">Issue and manage digital credentials on the blockchain</p>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveView('issue')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === 'issue'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Issue Credential</span>
          </button>
          <button
            onClick={() => {
              setActiveView('list');
              refetch();
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === 'list'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <List className="h-5 w-5" />
            <span>View Issued</span>
          </button>
        </div>

        {activeView === 'issue' && (
          <div className="card max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Issue New Credential</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Student Wallet Address *</label>
                  <input
                    type="text"
                    name="studentAddress"
                    value={formData.studentAddress}
                    onChange={handleInputChange}
                    placeholder="0x..."
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Student ID *</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="20231234"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">University Name</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Degree *</label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select degree</option>
                    {DEGREE_TYPES.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Major *</label>
                  <select
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select major</option>
                    {MAJOR_FIELDS.map(major => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Graduation Date</label>
                  <input
                    type="date"
                    name="graduationDate"
                    value={formData.graduationDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="btn-primary w-full"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                    {isPending ? 'Submitting...' : 'Confirming...'}
                  </>
                ) : (
                  'Issue Credential'
                )}
              </button>
            </form>
          </div>
        )}

        {activeView === 'list' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Issued Credentials</h2>
            {credentials && credentials.length > 0 ? (
              <div className="grid gap-4">
                {credentials.map((cred, index) => (
                  <div key={index} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold">{cred.studentName}</h3>
                          {cred.isRevoked ? (
                            <span className="badge-danger">Revoked</span>
                          ) : (
                            <span className="badge-success">Valid</span>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <p><span className="font-medium">ID:</span> {cred.tokenId.toString()}</p>
                          <p><span className="font-medium">Student ID:</span> {cred.studentId}</p>
                          <p><span className="font-medium">Degree:</span> {cred.degree}</p>
                          <p><span className="font-medium">Major:</span> {cred.major}</p>
                          <p><span className="font-medium">Issued:</span> {cred.issueDate}</p>
                          <p><span className="font-medium">Graduated:</span> {cred.graduationDate}</p>
                        </div>
                      </div>
                      {!cred.isRevoked && (
                        <button
                          onClick={() => handleRevoke(cred.tokenId)}
                          className="ml-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-slate-600">No credentials issued yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
