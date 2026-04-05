import { ethers } from 'ethers';

// ABI for the ResearchProvenance contract
const contractABI = [
  "function addDataset(string calldata _ipfsHash) external",
  "function getDataset(uint256 _id) external view returns (string memory ipfsHash, address researcher, uint256 timestamp)",
  "function datasetCount() external view returns (uint256)",
  "event DatasetAdded(uint256 indexed id, string ipfsHash, address indexed researcher, uint256 timestamp)"
];

// Address of the deployed contract on Sepolia
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error("MetaMask is not installed. Please install it to use this app.");
  }

  // Request account access
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];

  // Check if connected to Sepolia
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const sepoliaChainId = '0xaa36a7'; // 11155111 in hex

  if (chainId !== sepoliaChainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
    } catch (switchError) {
      throw new Error("Please switch to the Sepolia Testnet in your wallet.");
    }
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return { account, signer };
};

export const getContract = (signer) => {
  if (!contractAddress) {
      throw new Error("Contract address is missing in environment (REACT_APP_CONTRACT_ADDRESS).");
  }
  return new ethers.Contract(contractAddress, contractABI, signer);
};
