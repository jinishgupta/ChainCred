# ChainCred - Blockchain Credential Verification for Latin America

![ChainCred Banner](https://img.shields.io/badge/Built%20on-Polkadot%20Paseo-E6007A?style=for-the-badge&logo=polkadot)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🏆 **Product Track Submission**

ChainCred is a decentralized platform that eliminates credential fraud in Latin America by issuing tamper-proof digital credentials as NFTs on the Polkadot Paseo Testnet.

---

## 🎯 **The Problem**

- **30-40%** credential fraud rate in Latin America
- **2-4 weeks** average verification time
- **$1M+** annual cost to employers
- No standardized cross-border verification system

## 💡 **The Solution**

ChainCred provides:
- ✅ **Instant Verification** - Verify credentials in under 5 seconds
- ✅ **Tamper-Proof** - Blockchain-backed authenticity
- ✅ **Cross-Border** - Works seamlessly across institutions
- ✅ **Transparent** - Immutable verification trail

---

## 📦 **What's Included**

### ✅ Required Deliverables

1. **Live Application** - Fully functional web app
2. **Smart Contract** - Deployed on Paseo Testnet
3. **`/test` Page** - Interactive testing interface for judges
4. **Video Demo** - 3-minute product showcase
5. **GitHub Repository** - Complete source code with documentation

### 🎨 Features

- **University Portal** - Issue and manage credentials
- **Student Portal** - View and share credentials
- **Employer Verification** - Instant credential verification
- **Admin Dashboard** - Manage university permissions
- **Mobile Responsive** - Works on all devices
- **📱 Mobile Wallet Support** - Connect via MetaMask mobile app using WalletConnect
- **🔗 IPFS Integration** - Decentralized credential metadata storage

---

## 🚀 **Quick Start**

### Prerequisites

```bash
- Node.js v18+ 
- npm or yarn
- MetaMask wallet (browser extension or mobile app)
- Paseo testnet tokens
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chaincred.git
cd chaincred

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### Environment Setup

#### 1. Contracts (.env)

Create `contracts/.env`:

```bash
PRIVATE_KEY=your_private_key_here
```

#### 2. Frontend (.env)

Create `frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_ADMIN_ADDRESS=0xYourAdminAddress
VITE_CHAIN_ID=42161
VITE_RPC_URL=https://rpc.ibp.network/paseo
VITE_APP_URL=http://localhost:5173

VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

---

## 📝 **Smart Contract Deployment**

### Step 1: Compile Contract

```bash
cd contracts
npm run compile
```

### Step 2: Deploy to Paseo

```bash
npm run deploy
```

**Expected Output:**
```
ChainCred deployed to: 0x...
Contract Address: 0x...
Deployer (Admin): 0x...
```

### Step 3: Save Contract Details

Copy the contract address and admin address to `frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
VITE_ADMIN_ADDRESS=0xYourAdminAddressHere
```

---

## 💻 **Running the Application**

```bash
cd frontend
npm run dev
```

Application will be available at: `http://localhost:5173`

---

## 🧪 **Testing the Application**

### For Judges: `/test` Page

1. Navigate to `http://localhost:5173/test`
2. Connect your MetaMask wallet
3. Test the following functions:

#### Test Flow:

**Step 1: Add University (Admin Only)**
```
- Go to "Admin Functions" tab
- Enter a wallet address
- Click "Add University"
- Confirm transaction in MetaMask
```

**Step 2: Issue Credential (University Only)**
```
- Switch to the university wallet
- Go to "Issue Credential" tab
- Fill in student details:
  - Student Address: 0x...
  - Student Name: Juan Pérez
  - Student ID: 20231234
  - Degree: Bachelor of Science
  - Major: Computer Science
- Click "Issue Credential"
```

**Step 3: Verify Credential (Anyone)**
```
- Go to "Verify Credential" tab
- Enter credential ID (e.g., 0)
- Click "Verify Credential"
- View verification results
```

**Step 4: Revoke Credential (Issuer Only)**
```
- Go to "Revoke Credential" tab
- Enter credential ID
- Click "Revoke Credential"
```

---

## 📖 **Contract Information**

### Network Details

- **Network:** Polkadot Paseo Testnet
- **Chain ID:** 42161
- **RPC URL:** https://rpc.ibp.network/paseo
- **Contract Address:** `[Will be filled after deployment]`

### Contract Functions

#### Admin Functions
- `addUniversity(address)` - Grant university role

#### University Functions
- `issueCredential(...)` - Issue new credential
- `revokeCredential(uint256)` - Revoke existing credential
- `getUniversityCredentials(address)` - View issued credentials

#### Public Functions
- `verifyCredential(uint256)` - Verify any credential
- `getStudentCredentials(address)` - View student's credentials
- `getTotalCredentials()` - Get total count
- `isUniversity(address)` - Check university status

---

## 🏗️ **Architecture**

### Smart Contract (`contracts/ChainCred.sol`)

```solidity
- ERC-721 NFT standard for credentials
- Role-based access control (Admin, University)
- Credential struct with complete details
- Revocation mechanism
- Query functions for verification
```

### Frontend (`frontend/src`)

```
├── components/
│   ├── Navbar.jsx - Navigation with wallet connection
│   └── LoadingSpinner.jsx - Loading states
├── pages/
│   ├── HomePage.jsx - Landing page
│   ├── UniversityPage.jsx - Issue credentials
│   ├── StudentPage.jsx - View credentials
│   ├── VerifyPage.jsx - Verify credentials
│   └── TestPage.jsx - Testing interface
├── config/
│   ├── wagmi.js - Web3 configuration
│   └── abi.js - Contract ABI
└── utils/
    └── helpers.js - Utility functions
```

---

## 🎥 **Demo Video**

### Video Structure (3 minutes)

**0:00-0:20** - Problem Introduction
- Credential fraud statistics
- ChainCred solution overview

**0:20-2:40** - Product Demo (80% of video)
- University issuing credential
- Student viewing credential
- Employer verifying credential
- Show blockchain proof

**2:40-3:00** - Impact & Tech Stack
- Built on Polkadot Paseo
- Open source and ready for deployment

---

## 🔒 **Security Features**

- ✅ Role-based access control
- ✅ Only issuer can revoke credentials
- ✅ Immutable on-chain storage
- ✅ Cryptographic proof of authenticity
- ✅ No centralized database vulnerability

---

## 🌐 **Deployment to Production**

### Option 1: Vercel (Frontend)

```bash
cd frontend
npm run build
# Deploy to Vercel
vercel --prod
```

### Option 2: Netlify

```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

### Smart Contract Verification

```bash
npx hardhat verify --network paseo CONTRACT_ADDRESS
```

---

## 📊 **Use Cases**

### 1. Universities
- Issue digital diplomas
- Manage alumni credentials
- Reduce administrative overhead

### 2. Students
- Portable digital credentials
- Instant sharing with employers
- Lifetime access

### 3. Employers
- Instant verification
- No manual processing
- Fraud prevention

### 4. Government Agencies
- Cross-border verification
- Standardized credentialing
- Immigration processing

---

## 🛣️ **Future Roadmap**

- [ ] Multi-language support (Spanish, Portuguese)
- [ ] PDF certificate generation
- [ ] Integration with university systems
- [ ] Mobile app (iOS/Android)
- [ ] QR code verification
- [ ] Credential templates
- [ ] Batch issuance
- [ ] Analytics dashboard

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 **Team**

Built with ❤️ for the Latin American Hackathon 2025

---

## 📞 **Support**

For questions or support:
- GitHub Issues: [Create an issue](https://github.com/yourusername/chaincred/issues)
- Email: support@chaincred.io

---

## 🙏 **Acknowledgments**

- Polkadot/Paseo for the blockchain infrastructure
- OpenZeppelin for secure smart contract libraries
- Wagmi for seamless Web3 integration
- The Latin American developer community

---

## 📸 **Screenshots**

### Homepage
[Beautiful landing page with hero section]

### University Portal
[Issue credential interface]

### Student Portal
[View credentials with share options]

### Verification Page
[Instant verification results]

### Test Page
[Comprehensive testing interface for judges]

---

**Built for Latin American Hackathon 2025 - Product Track**

⭐ **Star this repo if you find it useful!**
