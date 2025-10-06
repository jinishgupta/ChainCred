import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { University, Plus, User2, AlertCircle, CheckCircle, Clock, List, Loader2 } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/wagmi';
import { CHAINCRED_ABI } from '../config/abi';
import { formatAddress, formatDate, DEGREE_TYPES, MAJOR_FIELDS } from '../utils/helpers';
import { uploadMetadataToIPFS } from '../utils/ipfs';

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

  // Track the current transaction type for proper messaging
  const [currentTxType, setCurrentTxType] = useState(null);

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
    if (isSuccess && currentTxType) {
      // Show success toast based on transaction type
      switch (currentTxType) {
        case 'registration':
          toast.success('🎉 University registration confirmed on blockchain!', {
            description: 'Your registration is now awaiting admin approval.',
            duration: 5000,
          });
          break;
        case 'credential':
          toast.success('🎓 Credential issued successfully!', {
            description: 'The credential has been minted and stored on blockchain.',
            duration: 5000,
          });
          break;
        case 'revoke':
          toast.success('🚫 Credential revoked successfully!', {
            description: 'The credential has been revoked on blockchain.',
            duration: 5000,
          });
          break;
        default:
          toast.success('✅ Transaction confirmed on blockchain!');
      }
      
      // Reset transaction type and refetch data
      setCurrentTxType(null);
      refetchUniversityInfo();
      refetch();
    }
  }, [isSuccess, currentTxType, refetchUniversityInfo, refetch]);

  // Show confirmation toast when transaction is being confirmed
  useEffect(() => {
    if (isConfirming && currentTxType) {
      toast.loading('⏳ Confirming transaction on blockchain...', {
        id: 'confirming-tx',
        description: 'Please wait while your transaction is being confirmed.',
      });
    } else {
      toast.dismiss('confirming-tx');
    }
  }, [isConfirming, currentTxType]);
  
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
      setCurrentTxType('registration');
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
      toast.info('📤 Registration transaction submitted to blockchain...', {
        description: 'Please wait for confirmation.',
      });
    } catch (error) {
      setCurrentTxType(null);
      toast.error(`❌ Registration failed: ${error.message || 'Unknown error'}`);
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
      toast.info('📤 Uploading credential metadata to IPFS...', {
        description: 'Preparing credential data for blockchain storage.',
      });
      console.log("uploading to ipfs")
      console.log(formData);
      const result = await uploadMetadataToIPFS({
        studentAddress: formData.studentAddress,
        studentName: formData.studentName,
        studentId: formData.studentId,
        university: formData.university,
        degree: formData.degree,
        major: formData.major,
        issueDate: formData.issueDate,
        graduationDate: formData.graduationDate,
      });
      console.log(result);
      setIsUploadingToIPFS(false);
      toast.success('✅ Metadata uploaded to IPFS successfully!');
      
      const tokenURI = result.metadataUrl;
      
      // Now mint the credential with IPFS CID
      setCurrentTxType('credential');
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'issueCredential',
        args: [
          formData.studentAddress,
          tokenURI,
        ],
      });
      toast.info('📤 Credential issuance transaction submitted...', {
        description: 'Please wait for blockchain confirmation.',
      });
    } catch (error) {
      console.log(error.message);
      setIsUploadingToIPFS(false);
      setCurrentTxType(null);
      toast.error(`❌ Failed to issue credential: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRevoke = async (tokenId) => {
    try {
      setCurrentTxType('revoke');
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHAINCRED_ABI,
        functionName: 'revokeCredential',
        args: [tokenId],
      });
      toast.info('📤 Credential revocation transaction submitted...', {
        description: 'Please wait for blockchain confirmation.',
      });
    } catch (error) {
      setCurrentTxType(null);
      toast.error(`❌ Failed to revoke credential: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-scale-in">
          <AlertCircle className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-bounce-gentle" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-lg text-slate-600">Please connect your wallet to access the university portal.</p>
        </div>
      </div>
    );
  }

  // Status: 0 = NotRegistered, 1 = Pending, 2 = Verified, 3 = Rejected
  const status = universityStatus !== undefined ? Number(universityStatus) : 0;
  
  // If university is not registered, show registration form
  if (status === 0) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card animate-scale-in">
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-gradient-to-br from-primary-100 to-blue-100 p-4 rounded-2xl shadow-lg animate-float">
                <University className="h-12 w-12 text-primary-600" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold gradient-text">University Registration</h1>
                <p className="text-lg md:text-xl text-slate-600 mt-2">Register your university to issue credentials</p>
              </div>
            </div>
            
            <form onSubmit={handleRegistration} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-3">University Name *</label>
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
                <label className="block text-lg font-semibold mb-3">Country *</label>
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
                <label className="block text-lg font-semibold mb-3">Registration Number *</label>
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
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 animate-pulse-gentle">
                <p className="text-base md:text-lg text-blue-900 leading-relaxed">
                  <strong className="text-lg">📝 Note:</strong> After registration, an administrator will review and verify your university. 
                  You will be able to issue credentials once approved.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="btn-primary w-full text-lg py-4 ripple"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin inline" />
                    <span className="text-lg font-semibold">{isPending ? 'Submitting...' : 'Confirming...'}</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold">Register University</span>
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
        <div className="card max-w-2xl w-full text-center animate-scale-in">
          <Clock className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-pulse-gentle" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Pending Verification</h2>
          <p className="text-lg md:text-xl text-slate-600 mb-6 leading-relaxed">
            Your university registration is pending approval from an administrator.
          </p>
          {universityInfo && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 text-left border-2 border-slate-200">
              <p className="text-base md:text-lg mb-3"><strong className="text-primary-600">University:</strong> {universityInfo.name}</p>
              <p className="text-base md:text-lg mb-3"><strong className="text-primary-600">Country:</strong> {universityInfo.country}</p>
              <p className="text-base md:text-lg mb-3"><strong className="text-primary-600">Registration #:</strong> {universityInfo.registrationNumber}</p>
              <p className="text-base md:text-lg"><strong className="text-primary-600">Address:</strong> {formatAddress(address)}</p>
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
  // No additional check needed since status is already verified

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center space-x-4 mb-6 ml-36">
            <div className="bg-gradient-to-br from-primary-100 to-blue-100 p-4 rounded-2xl shadow-lg animate-float">
              <University className="h-12 w-12 text-primary-600" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold gradient-text">University Portal</h1>
              <p className="text-lg md:text-xl text-slate-600 mt-2">Issue and manage digital credentials on the blockchain</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-10 ml-36">
          <button
            onClick={() => setActiveView('issue')}
            className={`flex items-center space-x-2 px-8 py-4 rounded-xl text-base font-bold transition-all transform hover:scale-105 ${
              activeView === 'issue'
                ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100 shadow-md'
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
            className={`flex items-center space-x-2 px-8 py-4 rounded-xl text-base font-bold transition-all transform hover:scale-105 ${
              activeView === 'list'
                ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100 shadow-md'
            }`}
          >
            <List className="h-5 w-5" />
            <span>View Issued</span>
          </button>
        </div>

        {activeView === 'issue' && (
          <div className="card max-w-5xl mx-auto animate-scale-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 gradient-text">Issue New Credential</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold mb-3">Student Wallet Address *</label>
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
                  <label className="block text-base font-semibold mb-3">Full Name *</label>
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
                  <label className="block text-base font-semibold mb-3">Student ID *</label>
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
                  <label className="block text-base font-semibold mb-3">University Name</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold mb-3">Degree *</label>
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
                  <label className="block text-base font-semibold mb-3">Major *</label>
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
                  <label className="block text-base font-semibold mb-3">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold mb-3">Graduation Date</label>
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
                className="btn-primary w-full text-lg py-4 ripple"
              >
                {isUploadingToIPFS ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin inline" />
                    <span className="text-lg font-semibold">Uploading to IPFS...</span>
                  </>
                ) : isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin inline" />
                    <span className="text-lg font-semibold">{isPending ? 'Submitting...' : 'Confirming...'}</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold">Issue Credential</span>
                )}
              </button>
            </form>
          </div>
        )}

        {activeView === 'list' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">Issued Credentials</h2>
            {credentials && credentials.length > 0 ? (
              <div className="grid gap-5">
                {credentials.map((cred, index) => (
                  <div key={index} className={`card animate-scale-in stagger-${(index % 5) + 1}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900">Credential #{index + 1}</h3>
                          {cred.isRevoked ? (
                            <span className="badge-danger text-sm px-3 py-1.5">Revoked</span>
                          ) : (
                            <span className="badge-success text-sm px-3 py-1.5">Valid</span>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-base">
                          <p className="bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                            <span className="font-semibold text-slate-600">Student:</span> 
                            <span className="ml-2 font-mono text-sm">{formatAddress(cred.studentAddress)}</span>
                          </p>
                          <p className="bg-white/50 backdrop-blur-sm p-2.5 rounded-lg">
                            <span className="font-semibold text-slate-600">Issuer:</span> 
                            <span className="ml-2 font-mono text-sm">{formatAddress(cred.issuer)}</span>
                          </p>
                        </div>
                      </div>
                      {!cred.isRevoked && (
                        <div className="ml-4 px-4 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-500 rounded-lg text-sm font-medium border border-gray-200">
                          Revoke (Coming Soon)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-16 animate-scale-in">
                <University className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-slate-700 mb-2">No Credentials Yet</h3>
                <p className="text-lg text-slate-600">
                  You haven't issued any credentials yet. Click "Issue Credential" to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
