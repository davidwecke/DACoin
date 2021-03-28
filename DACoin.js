var EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const blake3 = require('blake3');
const ec = new EC('secp256k1'); 
const CAKey = '';

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
        publicKey = ec.keyFromPublic(this.senderID, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

    verifyCA() {
        publicKey = ec.keyFromPublic(CAKey, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}

class Block{
    constructor(previousHash, difficulty){
        this.previousHash = previousHash;
        this.transactionList = [];
        this.nonce = 0;
        this.date = Date.now();
        this.difficulty = difficulty;
        this.hash = '';
    }

    addTrasactionsFromNode(node){
        this.transactionList.add(node.getReadyTransactions());
        while(node.length != 0) {
            this.transactionList.add(node.readyTransaction.pop());
        }
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
        }
        else if(transaction.verifyTransaction()) {
            // Transaction is either USER or SYSTEM, same procedure either way: Add to ready
            this.readyTransactions.push(transaction);
        }
        else{
            // The transaction hash did not verify

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
        })

        // Return the ready transactions, and clear the array
        return this.readyTransactions.splice(0,this.readyTransactions.length);
    }

    rejectTransaction(senderID) {
        this.pendingCATransactions.forEach(function(value, index, array) {
            if(value.senderID === senderID) {
                // Remove any matching transactions
                array.splice(index, 1);
            }
        })
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

class CentralAuthority {
    constructor() {
        this.key = ec.genKeyPair();
        this.publicKey = key.getPublic('hex');
        this.privateKey = key.getPrivate('hex');
    }

    //createTr
}

// Gen keypair/ make wallet -> send public key to the CA -> CA signs it

/* 
-------------------- Testing Code --------------------
*/

console.log(new Date(Date.now()));

DACoin = new Blockchain();

node = new Node();

console.log(new Date(DACoin.getHead().date));

// Make 3 wallets!
const davidsKey = ec.genKeyPair();
const davidsPubKey = davidsKey.getPublic('hex');
const davidsPrivKey = davidsKey.getPrivate('hex');

const alexsKey = ec.genKeyPair();
const alexsPubKey = alexsKey.getPublic('hex');
const alexsPrivKey = alexsKey.getPrivate('hex');


tx0 = new Transaction('david', 'alex', 5);
tx0Hash = tx0.getHash();
const sig = davidsKey.sign(tx0Hash);
tx0.receiveSignature(sig.toDER('hex'));

node.addTrasaction(tx0);

var block1 = new Block(DACoin.getHeadHash(), 5);

block1.transactionList.push(block1);

block1.generateHash();

DACoin.addBlock(block1);

var verifyString = DACoin.verify() ? 'Blockchain is valid' : 'Blockchain is NOT valid';

console.log(verifyString);

tx1 = new Transaction('alex', 'david', 10);
tx1Hash = tx1.getHash();

const sig1 = alexsKey.sign(tx1Hash);
tx1.receiveSignature(sig1.toDER('hex'));

var block2 = new Block(DACoin.getHeadHash(), 5);

block2.transactionList.push(block1);

block2.generateHash();

DACoin.addBlock(block2);

verifyString = DACoin.verify() ? 'Blockchain is valid' : 'Blockchain is NOT valid';

console.log(verifyString);