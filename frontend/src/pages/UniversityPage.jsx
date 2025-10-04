import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { University, Plus, List, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress, formatDate, DEGREE_TYPES, MAJOR_FIELDS } from '../utils/helpers';
import { uploadCredentialToIPFS } from '../utils/ipfs';

export default function UniversityPage() {
  const { address, isConnected } = useAccount();
  const [activeView, setActiveView] = useState('issue');
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  
  const [registrationData, setRegistrationData] = useState({
    name: '',
    country: '',
    registrationNumber: '',
  });
  
  const [formData, setFormData] = useState({
    studentAddress: '',
    studentName: '',
    studentId: '',
    university: '',
    degree: '',
    major: '',
    issueDate: new Date().toISOString().split('T')[0],
    graduationDate: new Date().toISOString().split('T')[0],
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: universityInfo, refetch: refetchUniversityInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'getUniversityInfo',
    args: [address],
  });
  
  const { data: universityStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CHAINCRED_ABI,
    functionName: 'getUniversityStatus',
    args: [address],
  });
  
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

  useEffect(() => {
    if (universityInfo && universityInfo.name) {
      setFormData(prev => ({ ...prev, university: universityInfo.name }));
    }
  }, [universityInfo]);
  
  useEffect(() => {
    if (isSuccess) {
      refetchUniversityInfo();
      refetch();
    }
  }, [isSuccess]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (!registrationData.name || !registrationData.country || !registrationData.registrationNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'registerUniversity',
        args: [
          registrationData.name,
          registrationData.country,
          registrationData.registrationNumber,
        ],
      });
      toast.success('University registration submitted! Awaiting admin approval.');
    } catch (error) {
      toast.error(error.message || 'Failed to register university');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentAddress || !formData.studentName || !formData.studentId || !formData.degree || !formData.major) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // Upload credential metadata to IPFS
      setIsUploadingToIPFS(true);
      toast.info('Uploading credential metadata to IPFS...');
      
      const ipfsCID = await uploadCredentialToIPFS({
        studentAddress: formData.studentAddress,
        studentName: formData.studentName,
        studentId: formData.studentId,
        university: formData.university,
        degree: formData.degree,
        major: formData.major,
        issueDate: formData.issueDate,
        graduationDate: formData.graduationDate,
      });
      
      setIsUploadingToIPFS(false);
      toast.success('Metadata uploaded to IPFS!');
      
      // Now mint the credential with IPFS CID
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
          ipfsCID,
        ],
      });
      toast.success('Credential issuance initiated!');
    } catch (error) {
      setIsUploadingToIPFS(false);
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

  // Status: 0 = NotRegistered, 1 = Pending, 2 = Verified, 3 = Rejected
  const status = universityStatus !== undefined ? Number(universityStatus) : 0;
  
  // If university is not registered, show registration form
  if (status === 0) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <University className="h-10 w-10 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold">University Registration</h1>
                <p className="text-slate-600">Register your university to issue credentials</p>
              </div>
            </div>
            
            <form onSubmit={handleRegistration} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">University Name *</label>
                <input
                  type="text"
                  name="name"
                  value={registrationData.name}
                  onChange={handleRegistrationChange}
                  placeholder="Universidad de Buenos Aires"
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={registrationData.country}
                  onChange={handleRegistrationChange}
                  placeholder="Argentina"
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={registrationData.registrationNumber}
                  onChange={handleRegistrationChange}
                  placeholder="Official registration or license number"
                  className="input-field"
                  required
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After registration, an administrator will review and verify your university. 
                  You will be able to issue credentials once approved.
                </p>
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
                  'Register University'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  // If university is pending verification
  if (status === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pending Verification</h2>
          <p className="text-slate-600 mb-4">
            Your university registration is pending approval from an administrator.
          </p>
          {universityInfo && (
            <div className="bg-slate-50 rounded-lg p-4 text-left">
              <p className="text-sm mb-1"><strong>University:</strong> {universityInfo.name}</p>
              <p className="text-sm mb-1"><strong>Country:</strong> {universityInfo.country}</p>
              <p className="text-sm mb-1"><strong>Registration #:</strong> {universityInfo.registrationNumber}</p>
              <p className="text-sm"><strong>Address:</strong> {formatAddress(address)}</p>
            </div>
          )}
          <p className="text-sm text-slate-500 mt-4">
            Please wait for admin approval. You will be notified once your university is verified.
          </p>
        </div>
      </div>
    );
  }
  
  // If university was rejected
  if (status === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Registration Rejected</h2>
          <p className="text-slate-600 mb-4">
            Your university registration was rejected by an administrator.
          </p>
          <p className="text-sm text-slate-500">Your address: {formatAddress(address)}</p>
          <p className="text-sm text-slate-500 mt-2">
            Please contact support for more information.
          </p>
        </div>
      </div>
    );
  }
  
  // Status 2 = Verified - show the full university portal
  if (!isUniversity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <Loader2 className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-slate-600">Verifying university status...</p>
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
                disabled={isPending || isConfirming || isUploadingToIPFS}
                className="btn-primary w-full"
              >
                {isUploadingToIPFS ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                    Uploading to IPFS...
                  </>
                ) : isPending || isConfirming ? (
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
