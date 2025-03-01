# Monad Token Swap DApp

A simple decentralized application for swapping tokens on the Monad network. This DApp provides a clean and intuitive interface for users to swap between two specific tokens.

## Features

- Simple and intuitive swap interface
- Connection to Monad network
- Real-time price updates
- Mobile-responsive design

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask wallet with Monad network configured

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd swap-monad-dapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Smart Contract Deployment

1. The smart contracts are located in the `contracts` directory
2. Deploy the contracts to Monad network using your preferred method
3. Update the contract addresses in the frontend configuration

## Configuration

To connect to the Monad network, add the following network configuration to your MetaMask:

- Network Name: Monad
- RPC URL: [Monad RPC URL]
- Chain ID: [Monad Chain ID]
- Currency Symbol: MONAD

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 