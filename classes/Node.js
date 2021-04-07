const Block = require("./Block");

class Node{
    constructor(blockchain){
        this.blockchainRef = blockchain;
        this.readyTransactions = [];
        this.pendingCATransactions = [];
    }

    addTransaction(transaction) {
        if(transaction.verifyCA()) {
            // Verified CA Transaction
            this.pendingCATransactions.push(transaction);
            console.log('Transaction successfully verified as CA Transaction! ');
        }
        else if(transaction.verifyTransaction()) {
            // Transaction is either USER or SYSTEM, same procedure either way: Add to ready
            if(transaction.amount <= 0) {
                // Throw out transaction
                console.log("threw out transaction of amount: " + transaction.amount + ' and sender id: ' + transaction.senderID);
            } else {
                this.readyTransactions.push(transaction);
            console.log('Transaction successfully verified and added to the Node!');
            }
            
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

module.exports = Node