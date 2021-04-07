const blake3 = require('blake3');
const Transaction = require('./Transaction');

class Block{
    constructor(previousHash){
        this.previousHash = previousHash;
        this.transactionList = [];
        this.tempTransactionList = [];
        this.nonce = 0;
        this.date = Date.now();
        this.difficulty = 5;
        this.hash = '';
    }

    addTransactionsFromNode(node){
        let tempArray = [].concat(this.tempTransactionList, node.getReadyTransactions());
        this.tempTransactionList = tempArray;
    }

    calculateHash(){
        var hashString = this.previousHash + this.transactionList.toString() + this.date + this.nonce;
        return blake3.hash(hashString).toString('hex');
    }

    mineBlock(rewardAddress, blockchain){
        // Go through each transaction
        //      - Verify the transaction(sig matches senderID/publicKey)
        //      - If verified, keep tally of available coins and add transact to the transactList

        let tally = new Map();
        
        this.tempTransactionList.forEach(function(transaction, index, array){
            if(transaction.verifyTransaction()) {
                if(tally.has(transaction.senderID)) {
                    // This is not a users first transaction
                    if(tally.get(transaction.senderID) < transaction.amount) {
                        // Not enough funds, reject
                    } else {
                        // Enough funds, update tally and push transaction
                        tally.set(transaction.senderID, tally.get(transaction.senderID) - transaction.amount);
                        this.transactionList.push(transaction);
                    }
                } else {
                    // This is the user first transaction this block
                    let userAvailableCoins = blockchain.getAvailableCoins(transaction.senderID);
                    if(userAvailableCoins < transaction.amount) {
                        // Not enough funds, reject

                    } else {
                        // Enough funds on first transaction so
                        this.transactionList.push(transaction);
                        tally.set(transaction.senderID, userAvailableCoins - transaction.amount);
                    }
                }
            } else {
                // Transction not verified. Throw it out. 
            }
        }, this);

        // Add Mining reward transaction
        this.transactionList.push(new Transaction('System Mining Reward', rewardAddress, blockchain.miningReward));
        
        // Mine hash
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

module.exports = Block