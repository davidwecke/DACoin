const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 

const myKey = ec.keyFromPrivate('fe39e6d0bb7eae81dd315c447cc9569a0338e6c3ec05d10893e360f33c78a619');
const myWalletAddress = myKey.getPublic('hex');

let davidAndAlexCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'someones Public Key', 10);
tx1.signTransaction(myKey);

davidAndAlexCoin.addTransaction(tx1);

console.log('Starting the miner...');
davidAndAlexCoin.minePendingTransactions(myWalletAddress);
console.log('\nBalance of david is ', davidAndAlexCoin.getBalanceOfAddress(myWalletAddress));


const chainValid = (davidAndAlexCoin.isChainValid()) ? "The chain is valid." : "The chain is NOT valid.";
console.log('Is the blockchain valid? \n' + chainValid);