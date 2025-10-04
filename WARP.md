# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ChainCred is a blockchain-based credential verification system for Latin America. It's a React + Solidity dApp that issues tamper-proof educational credentials as NFTs on the Polkadot Paseo Testnet. The project follows a clear separation between smart contract backend (`backend/`) and React frontend (`frontend/`).

## Architecture

### High-Level Structure
The project uses a dual-directory structure:
- `backend/` - Hardhat-based smart contract development
- `frontend/` - React + Vite frontend application

### Smart Contract Architecture (`backend/contracts/ChainCred.sol`)
The core contract inherits from OpenZeppelin's ERC721 and AccessControl:
- **Role System**: `DEFAULT_ADMIN_ROLE` (deployer) and `UNIVERSITY_ROLE` (credential issuers)
- **Credential Struct**: Comprehensive metadata including student info, degree details, timestamps, and revocation status
- **NFT Model**: Each credential is an NFT owned by the student, issued by universities
- **Access Control**: Only universities can issue/revoke, only issuers can revoke their own credentials

### Frontend Architecture (`frontend/src/`)
Built with React 19, using Wagmi for Web3 integration:
- **State Management**: React hooks + Wagmi for Web3 state
- **Routing**: React Router with role-based page access
- **Web3 Integration**: Wagmi + ethers.js connecting to Paseo testnet
- **UI Framework**: Tailwind CSS with custom components

## Common Commands

### Development Setup
```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your private key and configuration
```

### Smart Contract Development
```bash
cd backend

# Compile contracts
npx hardhat compile

# Deploy to Paseo testnet (requires configured .env)
node deploy.js

# Run tests (if any exist)
npx hardhat test
```

### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Testing the Application
```bash
# After deployment, update frontend/.env with contract address
# Start frontend and navigate to /test page for comprehensive testing interface
```

## Key Configuration

### Environment Variables
**Backend** (`.env`):
- `PRIVATE_KEY` - Wallet private key for deployment
- `PASEO_RPC_URL` - Polkadot Paseo testnet RPC URL

**Frontend** (`.env`):
- `VITE_CONTRACT_ADDRESS` - Deployed contract address
- `VITE_ADMIN_ADDRESS` - Contract deployer address
- `VITE_CHAIN_ID` - Network chain ID (42161 for Paseo)
- `VITE_RPC_URL` - RPC endpoint for frontend

### Network Configuration
The app is configured for Polkadot Paseo testnet:
- Chain ID: 42161 (frontend) / 420420422 (backend deployment)
- RPC: `https://rpc.ibp.network/paseo` (frontend) / `https://testnet-passet-hub-eth-rpc.polkadot.io` (backend)
- Currency: PAS tokens

## Important Files

### Contract Files
- `backend/contracts/ChainCred.sol` - Main contract (234 lines, well-documented)
- `backend/deploy.js` - Deployment script for Paseo testnet
- `backend/hardhat.config.js` - Hardhat configuration with Polkadot support

### Frontend Core
- `frontend/src/App.jsx` - Main app with routing setup
- `frontend/src/config/wagmi.js` - Web3 configuration and network setup
- `frontend/src/config/abi.js` - Contract ABI (auto-generated, 452 lines)
- `frontend/src/pages/TestPage.jsx` - **Critical for testing** - comprehensive interface for all contract functions

### Key Pages
- `HomePage.jsx` - Landing page with project overview
- `UniversityPage.jsx` - Credential issuance interface (role-gated)
- `StudentPage.jsx` - View owned credentials
- `VerifyPage.jsx` - Public credential verification
- `TestPage.jsx` - Admin interface for testing all functions

## Development Patterns

### Web3 Integration Pattern
The frontend uses Wagmi hooks consistently:
```javascript
const { data, isLoading, writeContract } = useWriteContract();
const { isConnected, address } = useAccount();
```

### Error Handling
- Contract interactions use try/catch with user-friendly toast notifications
- Loading states are implemented for all async operations
- Form validation before contract calls

### Role-Based Access
- Frontend checks user roles via contract calls before showing UI
- Contract enforces roles at the function level with modifiers
- Clear access denied messages for unauthorized actions

### State Management
- Component-level state for forms and UI
- Wagmi for Web3 state (wallet connection, contract data)
- React Query for caching contract read calls

## Testing Strategy

### Testing Interface (`/test` page)
The TestPage provides a comprehensive interface for judges/testing:
- Contract information display
- Admin functions (add university)
- Credential issuance forms
- Verification tools
- Revocation interface
- Transaction status tracking

### Manual Testing Flow
1. Connect wallet to Paseo testnet
2. Use `/test` page to test all contract functions
3. Verify role-based access control
4. Test the complete credential lifecycle (issue → verify → revoke)

## Deployment Process

### Contract Deployment
1. Configure `backend/.env` with private key
2. Ensure wallet has Paseo testnet tokens
3. Run `cd backend && node deploy.js`
4. Save contract address from output

### Frontend Deployment
1. Update `frontend/.env` with contract address
2. Build with `npm run build`
3. Deploy to Vercel/Netlify
4. Configure environment variables in hosting platform

## Troubleshooting

### Common Issues
- **"Insufficient funds"**: Get Paseo testnet tokens from faucet
- **"Contract not deployed"**: Verify VITE_CONTRACT_ADDRESS is set correctly
- **"Network mismatch"**: Ensure MetaMask is on Paseo testnet
- **Role access errors**: Verify wallet has required role (university/admin)

### Development Tips
- Use `/test` page for comprehensive function testing
- Check browser console for detailed error messages
- Verify environment variables are loaded correctly
- Ensure wallet is connected and on correct network

## Dependencies

### Backend
- Hardhat with Polkadot plugin (`@parity/hardhat-polkadot`)
- OpenZeppelin contracts for ERC721 and AccessControl
- ethers.js for deployment scripts

### Frontend  
- React 19 with Vite build tool
- Wagmi 2.x for Web3 integration
- Tailwind CSS for styling
- React Router for navigation
- Sonner for toast notifications