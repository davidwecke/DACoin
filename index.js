const Block = require('./classes/Block');
const Blockchain = require('./classes/Blockchain');
const CentralAuthority = require('./classes/CentralAuthority');
const Node = require('./classes/Node');
const User = require('./classes/User');


/* 
-------------------- Testing Code --------------------
*/
david = new User();
alex = new User();


DACoin = new Blockchain(david.wallet.publicKey);
DACoinNode = new Node();

DACoinCA = new CentralAuthority();
CAKey = DACoinCA.publicKey;


/* 
-------------------- Testing User End --------------------
*/


david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 60, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);
alex.wallet.createTransaction(david.wallet.publicKey, 5, DACoinNode, DACoin);


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

/*
Testing Transactions
david.wallet.createTransaction(alex.wallet.publicKey, 50, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 90, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 100, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, -100, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, -1, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 100, DACoinNode, DACoin);
david.wallet.createTransaction(alex.wallet.publicKey, 100, DACoinNode, DACoin);
*/

/* 
-------------------- Testing CA --------------------
*/
DACoinCA.registerUser(david.userID, '123-55-6666');
DACoinCA.requestTransfer(david.userID, '123-55-6666', alex.userID);
DACoinCA.requestTransfer(david.userID, '123-55-6666', alex.userID);

//console.log('Node ready transactions: ' + DACoinNode.readyTransactions);
//console.log('Pending CA Transactions: ' + DACoinNode.pendingCATransactions);

var block2 = new Block(DACoin.getHeadHash());
block2.addTransactionsFromNode(DACoinNode);
//console.log('Block 2 Temp Transactions BEFORE waiting 4000ms: ' + block2.tempTransactionList);

/* 
-------------------- CA Transaction is still rejectable --------------------
*/

//DACoinCA.rejectTransaction(david.wallet.publicKey, '123-55-6666');


setTimeout(function() {
    block2.addTransactionsFromNode(DACoinNode);
    //console.log('Pending CA Transactions AFER waiting 4000ms: ');
    //console.log(DACoinNode.pendingCATransactions);
    //console.log('Block 2 Temp Transactions AFER waiting 4000ms: ');
    //console.log(block2.tempTransactionList);
    block2.mineBlock(david.wallet.publicKey, DACoin);
    DACoin.addBlock(block2);

    console.log(DACoin);

    // Make CA Transaction only transfer 1 coin
    DACoin.blockchain[1].transactionList[0].amount = 100000;

    console.log('Alexs Coins: ' + DACoin.getAvailableCoins(alex.wallet.publicKey));
    console.log('Davids Coins: ' + DACoin.getAvailableCoins(david.wallet.publicKey));

    let blockchainValid = DACoin.verify() ? 'Yes! The DACoin chain is valid!' : 'No, the DACoin chain is not valid.';
    console.log('Is the blockchain valid? ' +  blockchainValid);
}, 3000);


