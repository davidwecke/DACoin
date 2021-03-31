var EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const blake3 = require('blake3');
const ec = new EC('secp256k1'); 
var CAKey = '';

const txType = {
    USER: 0,
    CA: 1,
    SYSTEM: 2
    }

class Transaction {
    constructor(senderID, receiverID, amount){
        this.senderID = senderID;
        this.receiverID = receiverID;
        this.amount = amount;
        this.date = Date.now();
        this.nonce = Math.floor(Math.random * 10000);
        this.hash = this.calculateHash();
        this.timeWait = 2000;
        this.CAKey = CAKey;
    }

    calculateHash() {
        return blake3.hash(this.senderID + this.receiverID + this.amount + this.date + this.nonce).toString('hex');
    }

    getHash() {
        return this.hash;
    }

    receiveSignature(signature) {
        this.signature = signature;
    }

    verifyTransaction() {
        var publicKey = ec.keyFromPublic(this.senderID, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

    verifyCA() {
        var publicKey = ec.keyFromPublic(CAKey, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}

class Block{
    constructor(previousHash){
        this.previousHash = previousHash;
        this.transactionList = [];
        this.nonce = 0;
        this.date = Date.now();
        this.difficulty = 5;
        this.hash = '';
    }

    addTrasactionsFromNode(node){
        this.transactionList = node.getReadyTransactions();
    }

    calculateHash(){
        var hashString = this.previousHash + this.transactionList.toString() + this.date + this.nonce;
        return blake3.hash(hashString).toString('hex');
    }

    generateHash(){
        do {
            this.nonce++;
            this.hash = this.calculateHash();
            //console.log(this.hash);
        } while(this.hash.slice(-this.difficulty) != Array(this.difficulty+1).join("1"));

        console.log('Successfully mined a block with hash: ' + this.hash + ' and nonce: ' + this.nonce);
    }

    getDebugString() {
        return this.previousHash + ' ' + this.transactionList.length + ' ' + this.date + ' ' + this.nonce;
    }

    verify(previousHash) {
        if (this.previousHash !== previousHash) {
            // Invalid previous hash!
            console.log('Invalid previous hash found!');
            return false;
        } else if(this.hash !== this.calculateHash()){
            // Wrong hash calculated found
            console.log('Wrong calculated hash found!');
            return false;
        } else {
            // Valid Block!
            return true;
        }
    }

    
}

class Node{
    constructor(){
        this.readyTransactions = [];
        this.pendingCATransactions = [];
    }

    addTrasaction(transaction) {
        if(transaction.verifyCA()) {
            // Verified CA Transaction
            this.pendingCATransactions.push(transaction);
            console.log('Transaction successfully verified as CA Transaction! ');
        }
        else if(transaction.verifyTransaction()) {
            // Transaction is either USER or SYSTEM, same procedure either way: Add to ready
            this.readyTransactions.push(transaction);
            console.log('Transaction successfully verified! ');
        }
        else{
            // The transaction hash did not verify

            console.log('Transaction failed to verify signature: ');
            

            // Discard transaction
        }
    }

    getReadyTransactions() {
        // Check if any pending transactions are ready
        this.pendingCATransactions.forEach(function(value, index, array) {
            if(value.date + value.timeWait <= Date.now() ) {
                // We have waited long enough, add tx to ready queue
                this.readyTransactions.push(array.splice(index, 1)[0]);
            }
        }, this);

        // Return the ready transactions, and clear the array
        return this.readyTransactions.splice(0,this.readyTransactions.length);
    }

    rejectTransaction(senderID, privateKey) {
        var key = ex.keyFromPrivate(privateKey);
        const publicKey = key.getPublic();
        if(publicKey === CAKey || publicKey === senderID) {
            // Find all transaction for that user
            this.pendingCATransactions.forEach(function(value, index, array) {
                if(value.senderID === senderID) {
                    // Remove any matching transactions
                    array.splice(index, 1);
                }
            })
        }
    }
}

class Blockchain {
    constructor() {
        this.blockchain = [];
        // Create genesis block
        this.createGenesisBlock();
    }

    createGenesisBlock() {
        var genesisBlock = new Block('Genesis Block, no previous hash.', 5);
        var genesisTransaction = new Transaction('david', 'alex', 0);
        genesisBlock.transactionList.push(genesisTransaction);
        genesisBlock.generateHash(); // Mine the block
        this.blockchain.push(genesisBlock);
    }

    getHeadHash() {
        if(this.blockchain.length !== 0) {
            return this.blockchain[this.blockchain.length-1].calculateHash();
        }
    }

    getHead() {
        if(this.blockchain.length !== 0) {
            return this.blockchain[this.blockchain.length-1];
        }
    }

    // Add a block to the blockchain
    addBlock(block) {
        // Pass the verify function the blockchain
        if (block.verify(this.getHeadHash())) {
            // Valid block, add it
            console.log('Successfully added a block!');
            this.blockchain.push(block);
        }
    }

    verify() {
        for(var i = 1; i < this.blockchain.length; i++) {
            if(!this.blockchain[i].verify(this.blockchain[i-1].calculateHash())) {
                return false;
            }
        }
        return true;
    }
}

class Wallet {
    constructor() {
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
    }

    sign(hash) {
        const sig = this.key.sign(hash);
        return sig.toDER('hex');
    }

    getTransactionHistory() { 
        // Traverse Blockchain

        // Output current coins

        // store temp variable JSON {timestamp, block, fundsAtTime}
    }

    createTransaction(receiverID, amount, node) {
        var transaction = new Transaction(this.publicKey, receiverID, amount);
        var sig = this.sign(transaction.getHash());
        transaction.receiveSignature(sig);
        node.addTrasaction(transaction);
    }
}

class User {
    constructor() {
        this.wallet = new Wallet();
        this.userID = this.wallet.publicKey;
    }
}

class CentralAuthority {
    constructor() {
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
        CAKey = this.publicKey;
        this.registeredUsers = [];
    }

    registerUser(userID, userSSN) {
        const userObj = {userID, userSSN};
        this.registeredUsers.push(userObj);
    }

    createTransaction(userID, userSSN, receiverID, node) {
        if(this.registeredUsers.find( function findUser(userObj) {
            return userObj.userID === userID && userObj.userSSN === userSSN;
        })) {
            // Create transaction on their behalf
            // Missing a getAvailableCoins functionality
            var transaction = new Transaction(userID, receiverID, 1);
            var sig = this.key.sign(transaction.getHash());
            var sigHex = sig.toDER('hex');
            transaction.receiveSignature(sigHex);
            node.addTrasaction(transaction);
        } else {
            console.log('User was not verified by CA');
        }
    }

    rejectTransaction(userID, userSSN) {
        if(this.registeredUsers.find( function findUser(userObj) {
            return userObj.userID === userID && userObj.userSSN === userSSN;
        })) {
            // Reject Transaction
            node.rejectTransaction(userID, this.privateKey);
        }
    }
}

// Gen keypair/ make wallet -> send public key to the CA -> CA signs it

/* 
-------------------- Testing Code --------------------
*/

console.log(new Date(Date.now()));

DACoin = new Blockchain();
DACoinNode = new Node();

console.log(new Date(DACoin.getHead().date));

DACoinCA = new CentralAuthority();
CAKey = DACoinCA.publicKey;


/* 
-------------------- Testing User End --------------------
*/

david = new User();
alex = new User();

david.wallet.createTransaction(alex.wallet.publicKey, 10, DACoinNode);
alex.wallet.createTransaction(david.wallet.publicKey, 5, DACoinNode);

var bogusTransaction = new Transaction(alex.wallet.publicKey, david.wallet.publicKey, 100);
var sig = alex.wallet.sign(bogusTransaction.getHash());
bogusTransaction.receiveSignature(sig);
DACoinNode.addTrasaction(bogusTransaction);

console.log('Davids public key ' + david.wallet.publicKey);
console.log('Alexs public key ' + alex.wallet.publicKey);

/* 
-------------------- Testing Miner End --------------------
*/

var block1 = new Block(DACoin.getHeadHash());
block1.addTrasactionsFromNode(DACoinNode);
block1.generateHash();
DACoin.addBlock(block1);

/* 
-------------------- Testing CA --------------------
*/
DACoinCA.registerUser(david.userID, '123-55-6666');
DACoinCA.createTransaction(david.userID, '123-55-6666', alex.userID, DACoinNode);

//console.log('Node ready transactions: ' + DACoinNode.readyTransactions);
console.log('Pending CA Transactions: ' + DACoinNode.pendingCATransactions);

var block2 = new Block(DACoin.getHeadHash());
block2.addTrasactionsFromNode(DACoinNode);
console.log('Block 2 Transactions BEFORE waiting 4000ms: ' + block2.transactionList);

setTimeout(function() {
    block2.addTrasactionsFromNode(DACoinNode);
    console.log('Block 2 Transactions AFER waiting 4000ms: ' + block2.transactionList);
    block2.generateHash();
    DACoin.addBlock(block2);

    console.log(DACoin);
}, 4000);


