const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx);
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature on this transaction.');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transactions) {
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block("01/01/2021", ["Genisis Block"], "0");
    }

    get latestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined!");
        this.chain.push(block);

        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
    }

    addTransaction(transaction) {
        if(!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must have a from and to Address.');
        }

        if(!transaction.isValid()) {
            throw new Error('Cannot add an invalid transaction. ');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            let currentBlock = this.chain[i];
            let previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()) {
                console.log('Triggering false calculation');
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log('Triggering false previous hash');
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;