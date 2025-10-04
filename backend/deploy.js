const { ethers, JsonRpcProvider } = require('ethers');
const {abi,bytecode} = require('./artifacts-pvm/contracts/ChainCred.sol/ChainCred.json')
require('dotenv').config();

// Polkadot Hub TestNet config
const provider = new JsonRpcProvider('https://testnet-passet-hub-eth-rpc.polkadot.io', {
  chainId: 420420422,
  name: 'polkadot-hub-testnet',
});

// Insert your private key here (keep it secure!)
const privateKey = process.env.PRIVATE_KEY;

async function main() {
  const wallet = new ethers.Wallet(privateKey, provider);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`Contract deployed at: ${address}`);
}

main().catch(console.error);