var EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 
const Block = require("./Block");

/*

Node Class

This class represents a temporary buffer for transactions between mining times.
Users and the CA send transactions to the Node and miners can grab these transactions 
and place them into blocks.

Users add transactions using the:
    addTransaction()
        This function performs a precursory signature verification in order to not flood
        the system with unnecesary transactions. 
        It also checks if a transaction is made by the CA or not, in which case it is 
        placed in a waiting queue for a time.
function. 

There are two more main functionalities of the Node class:
    getReadyTransactions():
        This function is used by miners to retrieve transactions ready
        to be added to the blockchain. It also performs a check on CA
        transactions to see if they have exceeded their wait limit and
        adds them to the readyTransactions list.
    rejectTransaction():
        This function allows users the ability to deny transactions made
        by the CA on their behalf as long as they can verify their private key
        to the Node. It then removes ALL transactions they are involved in. 

*/


class Node{
    constructor(){
        this.readyTransactions = [];
        this.pendingCATransactions = [];
    }

    addTransaction(transaction) {
        if(transaction.verifyCA()) {
            // Verified CA Transaction
            this.pendingCATransactions.push(transaction);
        }
        else if(transaction.verifyTransaction()) {
            // Transaction is either USER or SYSTEM, same procedure either way: Add to ready
            if(transaction.amount <= 0) {
                // Throw out transaction
            } else {
                this.readyTransactions.push(transaction);
            }
        }
        else{
            // The transaction hash did not verify
            console.log('Transaction failed to verify signature: ');

        }
    }

    getReadyTransactions() {
        // Check if any pending transactions are ready
        let tempCaPendingTransactions = [].concat(this.pendingCATransactions);

        // For loop iterating the CA transactions
        tempCaPendingTransactions.forEach(function(value, index, array) {
            if(value.date + value.timeWait <= Date.now() ) {
                // We have waited long enough, add tx to ready queue
                this.readyTransactions.push(value);
                this.pendingCATransactions.splice(this.pendingCATransactions.indexOf(value), 1);
            }
        }, this);

        // Return the ready transactions, and clear the array
        return this.readyTransactions.splice(0,this.readyTransactions.length);
    }

    rejectTransaction(senderID, privateKey) {
        var key = ec.keyFromPrivate(privateKey);
        const publicKey = key.getPublic('hex');
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