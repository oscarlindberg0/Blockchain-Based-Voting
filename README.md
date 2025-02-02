#  Blockchain-based voting

This is a **blockchain-based voting application** built using Solidity, Truffle, and Web3.js. The application allows users to **register candidates**, **vote**, and **view election results** securely on the Ethereum blockchain.

---

## Features
-  Register candidates (admin-only)
-  Vote for a candidate (one vote per person)
-  View live election results
-  Prevent duplicate voting

---

## Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/oscarlindberg0/Blockchain-Based-Voting.git
cd election-dapp
```

### 2. Install Node.js 16

`npm install`

### 3. Start a local blockchain using Ganache

option 1: Start Ganache GUI and create a new workspace.
option 2: Run Ganache CLI:
```
npm install -g ganache
ganache
```

### 4. Compile smart contracts
`truffle compile`

### 5. Deploy to local blockchain
`truffle migrate --reset`

### 6. Run tests
`truffle test`

### 7. Start the frontend
`npm start`
Open your browser and go to http://localhost:3000

## Notes
* Make sure Metamask is installed and connected to the Ganache network
* If you modify Election.sol, re-run truffle migrate --reset
* If truffle is not recognised, reinstall it:
`npm install -g truffle`

## License
This project is licensed under the MIT license

## Contributors
Oscar Lindberg - https://github.com/oscarlindberg0




