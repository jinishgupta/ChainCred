# 🚀 ChainCred Deployment Guide

This guide provides step-by-step instructions to deploy ChainCred for the hackathon submission.

---

## 📋 Pre-Deployment Checklist

- [ ] Node.js v18+ installed
- [ ] MetaMask wallet configured
- [ ] Paseo testnet added to MetaMask
- [ ] Paseo testnet tokens in wallet
- [ ] GitHub account ready
- [ ] Video recording software ready

---

## 🔧 Part 1: Setup Environment

### Step 1: Configure Paseo Testnet in MetaMask

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter the following details:
   - **Network Name:** Paseo Testnet
   - **RPC URL:** `https://rpc.ibp.network/paseo`
   - **Chain ID:** `42161`
   - **Currency Symbol:** `PAS`
   - **Block Explorer:** `https://polkadot.js.org/apps/`
4. Save and switch to Paseo network

### Step 2: Get Paseo Testnet Tokens

1. Visit Paseo faucet
2. Enter your wallet address
3. Request test tokens
4. Wait for confirmation

### Step 3: Clone and Install

```bash
cd ~/Desktop/"Latin Hack"
cd chaincred

# Install contract dependencies
cd contracts
cp .env.example .env
npm install

# Install frontend dependencies
cd ../frontend
cp .env.example .env
npm install
```

---

## 📝 Part 2: Deploy Smart Contract

### Step 1: Configure Contract Environment

Edit `contracts/.env`:

```bash
PASEO_RPC_URL=https://rpc.ibp.network/paseo
PRIVATE_KEY=<your_wallet_private_key>
```

**⚠️ IMPORTANT:** Never commit this file! It's in `.gitignore`.

**To get your private key:**
1. Open MetaMask
2. Click (...) menu → Account Details
3. Click "Export Private Key"
4. Enter password → Copy key
5. Paste in `.env` file

### Step 2: Compile Contract

```bash
cd contracts
npm run compile
```

**Expected output:**
```
Compiled 1 Solidity file successfully
```

### Step 3: Deploy to Paseo

```bash
npm run deploy
```

**Expected output:**
```
Deploying ChainCred contract to Paseo testnet...
Deploying with account: 0x...
Account balance: X.XX ETH

ChainCred deployed to: 0x1234...5678
```

### Step 4: Save Contract Information

**IMPORTANT:** Copy and save:
- Contract Address: `0x...`
- Deployer Address: `0x...`
- Transaction Hash: `0x...`

You'll need these for the frontend!

---

## 💻 Part 3: Configure Frontend

### Step 1: Update Frontend Environment

Edit `frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=0x<your_contract_address>
VITE_ADMIN_ADDRESS=0x<your_deployer_address>
VITE_CHAIN_ID=42161
VITE_CHAIN_NAME=Paseo Testnet
VITE_RPC_URL=https://rpc.ibp.network/paseo
VITE_BLOCK_EXPLORER=https://polkadot.js.org/apps/
VITE_APP_URL=http://localhost:5173
```

### Step 2: Test Locally

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

### Step 3: Test All Features

**Connect Wallet:**
1. Click "Connect Wallet"
2. Approve MetaMask connection
3. Verify address shows in navbar

**Test /test Page:**
1. Go to `/test`
2. Verify contract information displays
3. Test each tab (Info, Admin, Issue, Verify, Revoke)

**Test Main Features:**
1. Go to `/university` - Check access control
2. Go to `/student` - View empty state
3. Go to `/verify` - Test search interface

---

## 🌐 Part 4: Deploy to Production

### Option A: Vercel Deployment

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Configure Environment Variables in Vercel:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from `.env`
5. Redeploy

### Option B: Netlify Deployment

```bash
cd frontend
npm run build

# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**Configure Environment Variables in Netlify:**
1. Go to Netlify Dashboard
2. Site Settings → Build & Deploy → Environment
3. Add all variables
4. Trigger redeploy

---

## 🧪 Part 5: Complete Testing Flow

### Test 1: Admin Adds University

```bash
# Using the deployer wallet:
1. Go to /test → Admin Functions
2. Enter a test university address
3. Click "Add University"
4. Approve transaction
5. Wait for confirmation
```

### Test 2: University Issues Credential

```bash
# Switch to university wallet:
1. Go to /university
2. Verify you have access
3. Fill credential form:
   - Student Address: <test_address>
   - Student Name: "María García"
   - Student ID: "2025001"
   - University: "Universidad de Buenos Aires"
   - Degree: "Bachelor of Science"
   - Major: "Computer Science"
   - Issue Date: <today>
   - Graduation Date: <today>
4. Click "Issue Credential"
5. Approve transaction
6. Note the credential ID (usually 0 for first)
```

### Test 3: Student Views Credential

```bash
# Switch to student wallet:
1. Go to /student
2. See your credential
3. Click "Share" - copy link
4. Click "View on Chain"
```

### Test 4: Employer Verifies

```bash
# No wallet needed:
1. Go to /verify
2. Enter credential ID (0)
3. Click "Verify Credential"
4. See green checkmark and full details
```

### Test 5: Revoke and Re-verify

```bash
# Back to university wallet:
1. Go to /university → View Issued
2. Click "Revoke" on credential
3. Approve transaction
4. Go to /verify
5. Enter same credential ID
6. See red X (revoked)
```

---

## 🎥 Part 6: Record Demo Video

### Video Checklist

**Before Recording:**
- [ ] Deploy to production (use live URL)
- [ ] Have test credentials ready
- [ ] Close unnecessary tabs
- [ ] Test audio/video quality
- [ ] Prepare script

**Video Structure (3 minutes):**

**0:00-0:20 - Problem (20 seconds)**
```
Script:
"In Latin America, 30-40% of credentials are fraudulent.
Traditional verification takes 2-4 weeks and costs employers millions annually.
ChainCred solves this with blockchain technology."

Show: Homepage with stats
```

**0:20-1:10 - University Flow (50 seconds)**
```
Script:
"Universities can issue tamper-proof credentials in seconds."

Show:
1. University portal login
2. Fill credential form
3. Submit transaction
4. Show confirmation
5. View in issued list
```

**1:10-1:50 - Student Flow (40 seconds)**
```
Script:
"Students receive their credentials as NFTs and can share them instantly."

Show:
1. Student portal
2. Credential display with details
3. Click share button
4. Copy link
```

**1:50-2:40 - Employer Flow (50 seconds)**
```
Script:
"Employers can verify any credential in under 5 seconds."

Show:
1. Verification page
2. Paste credential ID
3. Click verify
4. Show green checkmark
5. Display all details
6. Show blockchain proof
```

**2:40-3:00 - Closing (20 seconds)**
```
Script:
"ChainCred: Ending credential fraud in Latin America.
Built on Polkadot Paseo. Open source. Ready for deployment.
Thank you!"

Show: Homepage with CTA
```

### Recording Tools

- **Mac:** QuickTime Screen Recording
- **Windows:** OBS Studio
- **Online:** Loom, Screencast-O-Matic

### Editing Tips

1. Use captions for clarity
2. Add background music (low volume)
3. Use zoom/highlight for important clicks
4. Keep transitions smooth
5. Export in HD (1080p)

---

## 📦 Part 7: GitHub Repository Setup

### Step 1: Initialize Git

```bash
cd ~/Desktop/"Latin Hack"/chaincred
git init
git add .
git commit -m "Initial commit: ChainCred - Blockchain Credential Verification"
```

### Step 2: Create GitHub Repository

1. Go to github.com
2. Click "New Repository"
3. Name: `chaincred`
4. Description: "Blockchain-based credential verification for Latin America"
5. Public repository
6. Don't initialize with README (we have one)
7. Click "Create"

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/chaincred.git
git branch -M main
git push -u origin main
```

### Step 4: Update README

Edit `README.md` and update:
- Contract address
- Live deployment URL
- Video demo link (when uploaded)
- Screenshot links (optional)

```bash
git add README.md
git commit -m "Update README with deployment details"
git push
```

---

## ✅ Part 8: Final Submission Checklist

### Required Deliverables

- [ ] **Live Application URL**
  - Working /test page
  - All features functional
  - Contract integrated

- [ ] **GitHub Repository**
  - Public repository
  - Complete README
  - All source code
  - Contract address in README
  - Setup instructions

- [ ] **Demo Video (3 minutes)**
  - Uploaded to YouTube/Vimeo
  - Link in README
  - Demonstrates all features
  - Shows blockchain proof

- [ ] **Smart Contract**
  - Deployed to Paseo
  - Contract address documented
  - ABI in repository
  - Functions work correctly

- [ ] **Documentation**
  - README.md complete
  - Setup instructions clear
  - Testing guide included
  - Architecture explained

### Testing Before Submission

**Run through this flow one final time:**

1. ✅ Open /test page → See contract info
2. ✅ Admin adds university → Transaction succeeds
3. ✅ University issues credential → NFT minted
4. ✅ Student views credential → Shows correctly
5. ✅ Employer verifies credential → Green checkmark
6. ✅ Revoke credential → Status updates
7. ✅ Re-verify → Shows revoked

---

## 🎯 Submission

### What to Submit

1. **Application URL:** `https://your-app.vercel.app`
2. **GitHub URL:** `https://github.com/yourusername/chaincred`
3. **Video URL:** `https://youtube.com/watch?v=...`
4. **Contract Address:** `0x...`
5. **Network:** Polkadot Paseo Testnet

### Submission Platform

Follow the hackathon submission guidelines:
1. Fill out submission form
2. Provide all URLs
3. Add team information
4. Submit before deadline

---

## 🆘 Troubleshooting

### Contract Deployment Failed

**Issue:** Transaction reverted
**Solution:**
- Check you have enough Paseo tokens
- Verify network configuration
- Check RPC URL is correct

### Frontend Not Connecting to Contract

**Issue:** Contract functions not working
**Solution:**
- Verify contract address in `.env`
- Check network in MetaMask matches
- Ensure wallet is connected
- Check browser console for errors

### Transactions Failing

**Issue:** MetaMask rejecting transactions
**Solution:**
- Check gas settings
- Verify correct network
- Reset MetaMask account (Settings → Advanced → Reset)
- Get more testnet tokens

### /test Page Not Working

**Issue:** Contract info not displaying
**Solution:**
- Check CONTRACT_ADDRESS env variable
- Verify contract is deployed
- Check ABI is correct
- Open console for error details

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables
3. Test contract on Paseo explorer
4. Review deployment logs

---

## 🎉 Congratulations!

You've successfully deployed ChainCred! Your application is now:
- ✅ Live and accessible
- ✅ Fully functional on Paseo
- ✅ Ready for judges to test
- ✅ Documented and open source

**Good luck with your hackathon submission!** 🚀

---

**Built for Latin American Hackathon 2025 - Product Track**
