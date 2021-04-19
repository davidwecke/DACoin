const blake3 = require('blake3');
const Transaction = require('./Transaction');

/*

Block Class

This class is a container for transactions which is linked together
to form the block chain. 

It contains 2 main functions:
    addTransactionsFromNode()
        This function grabs all available ready transactions that
        users have posted to the Node and sets them into a temp array.

    mineBlock()
        This function checks the validity of all transactions by
        comparing the senders address with the signature, as well as 
        checking if there are enough funds in the senders wallet to perform
        the transaction.

        After verifying the transactions, the function will calculate hashes until
        one is found with the associated difficulty.

        Once the hash is found, the block is ready to be added to the blockchain.

*/

class Block{
    constructor(previousHash){
        this.previousHash = previousHash;
        this.transactionList = [];
        this.tempTransactionList = [];
        this.nonce = 0;
        this.date = Date.now();
        this.difficulty = 3;
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
        // Started to mine output message.
        console.log('Started to mine block ' + blockchain.blockchain.length + ' ...');

        // Temp counter to find available funds for each user. 
        let tally = new Map();
        
        // For loop iterating over all temp transactions, to verify them and add up the tally of funds. 
        this.tempTransactionList.forEach(function(transaction, index, array){
            if(transaction.verifyTransaction() || transaction.verifyCA()) {
                if(tally.has(transaction.senderID)) {
                    // This is not a users first transaction
                    if(tally.get(transaction.senderID) < transaction.amount) {
                        // Not enough funds, reject
                        console.log('Transaction denied due to insufficient funds');
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
                console.log('Transaction: ' + transaction + ' was thrown out for not being verified!');
            }
        }, this);

        // After adding all legitimate transactions, add mining reward transaction for the miner. 
        this.transactionList.push(new Transaction('System Mining Reward', rewardAddress, blockchain.miningReward));
        
        // 'Mine' hash
        do {
            this.nonce++;
            this.hash = this.calculateHash();
            //console.log(this.hash);
        } while(this.hash.slice(-blockchain.difficulty) != Array(blockchain.difficulty+1).join("1"));

        // Success mined message. 
        console.log('Successfully mined a block with hash: ' + this.hash + ' and nonce: ' + this.nonce);
    }

    // Debug function for output verification of certain variables. 
    getDebugString() {
        return this.previousHash + ' ' + this.transactionList.length + ' ' + this.date + ' ' + this.nonce;
    }

    // Check that the hash set in the block matches what the calculations say.
    // The use case of this function is for transactions that were modified after
    // the hash was initially calculated. 
    verify() {
        if(this.hash !== this.calculateHash()){
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