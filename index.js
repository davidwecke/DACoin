const Block = require('./classes/Block');
const Blockchain = require('./classes/Blockchain');
const CentralAuthority = require('./classes/CentralAuthority');
const Node = require('./classes/Node');
const User = require('./classes/User');


/* 
-------------------- Testing Code --------------------
*/

DACoin = new Blockchain();
DACoinNode = new Node(DACoin);

DACoinCA = new CentralAuthority();
CAKey = DACoinCA.publicKey;


/* 
-------------------- Testing User End --------------------
*/

david = new User();
alex = new User();

alex.wallet.createTransaction(david.wallet.publicKey, 5, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);

/*
var bogusTransaction = new Transaction(alex.wallet.publicKey, david.wallet.publicKey, 100);
var sig = alex.wallet.sign(bogusTransaction.getHash());
bogusTransaction.receiveSignature(sig);
DACoinNode.addTransaction(bogusTransaction);
*/

console.log('Davids public key ' + david.wallet.publicKey);
console.log('Alexs public key ' + alex.wallet.publicKey);

/* 
-------------------- Testing Miner End --------------------
*/

var block1 = new Block(DACoin.getHeadHash());
block1.addTransactionsFromNode(DACoinNode);
block1.mineBlock(david.wallet.publicKey, DACoin);
console.log('Transaction list block 1 : ' + block1.transactionList);
DACoin.addBlock(block1);

/* 
-------------------- Testing Sending after mining --------------------
*/

david.wallet.createTransaction(alex.wallet.publicKey, 50, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 90, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 100, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, -100, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, -1, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 100, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 100, DACoinNode, DACoin);

/* 
-------------------- Testing CA --------------------
*/
DACoinCA.registerUser(david.userID, '123-55-6666');
DACoinCA.createTransaction(david.userID, '123-55-6666', alex.userID, DACoinNode, DACoin);

//console.log('Node ready transactions: ' + DACoinNode.readyTransactions);
console.log('Pending CA Transactions: ' + DACoinNode.pendingCATransactions);

var block2 = new Block(DACoin.getHeadHash());
block2.addTransactionsFromNode(DACoinNode);
console.log('Block 2 Transactions BEFORE waiting 4000ms: ' + block2.transactionList);

setTimeout(function() {
    block2.addTransactionsFromNode(DACoinNode);
    console.log('Block 2 Transactions AFER waiting 4000ms: ' + block2.transactionList);
    block2.mineBlock(david.wallet.publicKey, DACoin);
    DACoin.addBlock(block2);

    console.log(DACoin);

    console.log('Alexs Coins: ' + DACoin.getAvailableCoins(alex.wallet.publicKey));
    console.log('Davids Coins: ' + DACoin.getAvailableCoins(david.wallet.publicKey));
}, 4000);


