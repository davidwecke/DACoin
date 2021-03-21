var EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const blake3 = require('blake3');
const ec = new EC('secp256k1'); 

const txType = {
    USER: 0,
    CA: 1,
    SYSTEM: 2
    }

class Transaction {
    constructor(senderID, receiverID, amount, type){
        this.senderID = senderID;
        this.receiverID = receiverID;
        this.amount = amount;
        this.type = type;
        this.date = Date.now();
        this.nonce = Math.floor(Math.random * 10000);
        this.hash = this.calculateHash();
        this.timeWait = 100000;
    }

    calculateHash() {
        return blake3.hash(this.senderID + this.receiverID + this.amount + this.type + this.date + this.nonce).toString('hex');
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

    generateHash(){
        do {
            var hashString = this.previousHash + this.transactionList.toString() + this.date + this.nonce;
            this.hash = blake3.hash(hashString).toString('hex');
            //console.log(this.hash);
            this.nonce++;
        } while(this.hash.slice(-this.difficulty) != Array(this.difficulty+1).join("0"));

        console.log('Successfully mined a block with hash: ' + this.hash);
    }
}

class Node{
    constructor(){
        this.readyTransactions = [];
        this.pendingCATransactions = [];
    }

    addTrasaction(transaction) {
        if(transaction.verifyTransaction()) {
            // If the transaction hash is verified, check the type
            if(transaction.type == txType.CA) {
                this.pendingCATransactions.push(transction)
            }
            else if(transaction.type == txType.USER) {
                this.readyTransactions.push(transaction);
            }
            else if(transaction.type == txType.SYSTEM) {
                this.readyTransactions.push(transaction);
            }
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

    rejectTransaction(userID) {
        this.pendingCATransactions.forEach(function(value, index, array) {
            if(value.userID === userID) {
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
        var genesisTransaction = new Transaction('david', 'alex', 0, txType.SYSTEM);
        genesisBlock.transactionList.push(genesisTransaction);
        genesisBlock.generateHash();
        this.blockchain.push(genesisBlock);
    }

    getHeadHash() {
        if(this.blockchain.length !== 0) {
            return this.blockchain[this.blockchain.length-1].hash;
        }
    }

    getHead() {
        if(this.blockchain.length !== 0) {
            return this.blockchain[this.blockchain.length-1];
        }
    }
}

console.log(new Date(Date.now()));

DACoin = new Blockchain();

console.log(new Date(DACoin.getHead().date));