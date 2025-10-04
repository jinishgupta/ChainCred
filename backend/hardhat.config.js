require("@nomicfoundation/hardhat-toolbox")
require("@parity/hardhat-polkadot")

const { vars } = require('hardhat/config');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    resolc: {
        compilerSource: "npm",
        settings: {
            optimizer: {
                enabled: true,
                parameters: 'z',
                fallbackOz: true,
                runs: 200,
            },
            standardJson: true,
        },
    },
    networks: {
        hardhat: {
            polkavm: true,
            forking: {
                url: "https://testnet-passet-hub.polkadot.io",
            },
            adapterConfig: {
                adapterBinaryPath: "./bin/eth-rpc",
                dev: true,
            },
        },
        localNode: {
            polkavm: true,
            url: `http://127.0.0.1:8545`,
        },
        polkadotHubTestnet: {
            polkavm: true,
            url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
            accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY')] : [],
        },
    },
}
