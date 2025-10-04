# 🚀 Quick Start Guide

Get ChainCred running in 5 minutes!

## ⚡ TL;DR

```bash
# 1. Install dependencies
cd contracts && npm install && cd ../frontend && npm install

# 2. Setup environment files
cd contracts && cp .env.example .env
cd ../frontend && cp .env.example .env

# 3. Add your private key to contracts/.env
# PRIVATE_KEY=your_key_here

# 4. Deploy contract
cd contracts && npm run deploy

# 5. Copy contract address to frontend/.env
# VITE_CONTRACT_ADDRESS=0x...

# 6. Start frontend
cd frontend && npm run dev

# 7. Open http://localhost:5173
```

---

## 📝 Detailed Steps

### 1. Install Node.js Dependencies

```bash
cd "/home/jinish-gupta/Desktop/Latin Hack/chaincred"

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Contracts:**
```bash
cd contracts
cp .env.example .env
nano .env  # or use any text editor
```

Add your MetaMask private key:
```
PASEO_RPC_URL=https://rpc.ibp.network/paseo
PRIVATE_KEY=your_private_key_here
```

**Frontend:**
```bash
cd ../frontend
cp .env.example .env
```

You'll update this after deploying the contract.

### 3. Deploy Smart Contract

```bash
cd contracts
npm run deploy
```

**Copy the output!** You'll see:
```
ChainCred deployed to: 0xABC123...
Deployer (Admin): 0xDEF456...
```

### 4. Update Frontend Configuration

Edit `frontend/.env`:
```bash
VITE_CONTRACT_ADDRESS=0xABC123...  # from step 3
VITE_ADMIN_ADDRESS=0xDEF456...      # from step 3
VITE_CHAIN_ID=42161
VITE_RPC_URL=https://rpc.ibp.network/paseo
VITE_APP_URL=http://localhost:5173
```

### 5. Start the Application

```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

---

## ✅ Test Checklist

1. **Connect Wallet**
   - Click "Connect Wallet" in navbar
   - Approve MetaMask connection
   - See your address displayed

2. **Visit /test Page**
   - Go to http://localhost:5173/test
   - Verify contract info displays
   - See total credentials count

3. **Add University** (if you're the admin)
   - Admin Functions tab
   - Enter wallet address
   - Click "Add University"

4. **Issue Credential** (if you have university role)
   - Issue Credential tab
   - Fill all fields
   - Submit transaction

5. **Verify Credential**
   - Verify tab
   - Enter credential ID (0 for first)
   - Click "Verify"

---

## 🎯 Common Issues

### "Insufficient funds for gas"
- Get Paseo testnet tokens from faucet
- Wait a few minutes for tokens to arrive

### "Contract not deployed"
- Make sure you ran `npm run deploy` in contracts folder
- Check VITE_CONTRACT_ADDRESS in frontend/.env

### "Network mismatch"
- Add Paseo testnet to MetaMask
- Switch to Paseo network

### "Transaction rejected"
- Check you're on Paseo network
- Ensure you have enough test tokens
- Try resetting your MetaMask account

---

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment
- Check contract at `contracts/ChainCred.sol`
- Explore frontend code in `frontend/src/`

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Verify all environment variables are set
3. Make sure you're on Paseo testnet
4. Review the deployment logs

**Happy hacking!** 🎉
