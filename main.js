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
alex.wallet.createTransaction(david.wallet.publicKey, 5, DACoinNode, DACoin);

DACoinCA.requestTransfer(alex.userID, '123-45-6789', david.userID);
DACoinCA.registerUser(alex.userID, '123-45-6789', alex.wallet.sign('123-45-6789'));
DACoinCA.requestTransfer(alex.userID, '123-45-6789', david.userID);

console.log(DACoinNode.pendingCATransactions[0]);

/* 
-------------------- Testing Miner End --------------------
*/

david.mineNextBlock();

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
DACoinCA.registerUser(david.userID, '123-55-6666', david.wallet.sign('123-55-6666'));
DACoinCA.requestTransfer(david.userID, '123-55-6666', alex.userID);
DACoinCA.requestTransfer(david.userID, '123-55-6666', alex.userID);

var block2 = new Block(DACoin.getHeadHash());
block2.addTransactionsFromNode(DACoinNode);


/* 
-------------------- CA Transaction is still rejectable --------------------
*/


// Wait 4 seconds to add CA transaction when they are off 'cooldown'.
setTimeout(function() {
    block2.addTransactionsFromNode(DACoinNode);
    block2.mineBlock(david.wallet.publicKey, DACoin);
    DACoin.addBlock(block2);

    console.log(DACoin);

    console.log('Alexs Coins: ' + DACoin.getAvailableCoins(alex.wallet.publicKey));
    console.log('Davids Coins: ' + DACoin.getAvailableCoins(david.wallet.publicKey));

    console.log('Verifying blockchain validity...');

    let blockchainValid = DACoin.verify() ? 'Yes! The DACoin chain is valid!' : 'No, the DACoin chain is not valid.';
    console.log('Is the blockchain valid? ' +  blockchainValid);
}, 3000);


