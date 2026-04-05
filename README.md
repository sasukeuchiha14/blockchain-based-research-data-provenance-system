# Blockchain-Based Research Data Provenance System

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-e6e6e6?style=flat&logo=solidity&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

A full-stack, decentralized provenance system designed to solve the reproducibility crisis in academia. By creating a transparent, immutable, and cryptographically secure audit trail, this system enforces trust and validates research dataset history via smart contracts on the Ethereum blockchain.

---

## 🎯 Key Features

- **Decentralized Storage:** Datasets are encrypted and hashed instantly into the Pinata IPFS Protocol. Memory limits, CORS, and rate limiting assure bulletproof storage mechanisms.
- **Immutable Smart Contracts:** Records each upload event dynamically, generating a permanent trace tying the exact dataset hash (CID) to the researcher's wallet address.
- **File Validation Engine:** Seamlessly drag and drop datasets backwards onto the platform to run a decentralized verification sweep. Evaluates the hash against the global history without logging redundant on-chain transactions.
- **Glassmorphism UI:** Features an incredibly performant React SPA built exclusively using Tailwind CSS v3 utility classes for mobile responsiveness and premium aesthetics.
- **Production Ready API:** Native node.js integrations capable of SSL termination directly behind VPS environments.

---

## 🏗️ Technical Architecture

1. **Frontend:** React.js, Tailwind CSS v3, and Ethers.js v6.
2. **Backend:** Node.js, Express.js. Implements robust security arrays via `helmet` and `multer`. 
3. **Decentralized Network:** Solidity `^0.8.20`, deployed via Remix/Hardhat to the **Sepolia Testnet**. IPFS connections routed via Pinata.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MetaMask Browser Extension
- Pinata API Credentials
- VPS (optional, for deployment)

### 1. Smart Contract Deployment
1. Navigate to the `contracts/` directory or use Remix IDE.
2. Deploy `ResearchProvenance.sol` using an injected Web3 provider connected to Sepolia.
3. Save the resulting deployed smart contract address.

### 2. Backend Setup
The backend runs behind an Nginx reverse proxy using an internal `HTTP` bind. 

1. `cd backend`
2. `npm install`
3. Configure the `.env` file:
   ```env
   PORT=5000
   FRONTEND_URL=your_frontend_url_here
   PINATA_API_KEY=your_api_key
   PINATA_SECRET_API_KEY=your_secret_key
   GROUP_ID=your_pinata_group_id_here
   ```
4. Start the server using `node server.js` (or via PM2: `pm2 start server.js`).

### 3. Frontend Setup
The frontend securely links user wallets directly to the blockchain trace map.

1. `cd frontend`
2. `npm install`
3. Configure the `.env` file at the root of `frontend/`:
   ```env
   REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
   REACT_APP_BACKEND_URL=your_backend_url_here
   ```
4. Build the system utilizing Tailwind variables: `npm run build`
5. Host the resultant `/build` directory on **Netlify** or Cloudflare Pages. *(Note: Configure Netlify to push exclusively out of the `frontend/build` path)*.

---

## 📜 License

This project is open-source software licensed under the [MIT License](LICENSE.txt).
