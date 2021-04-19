var EC = require('elliptic').ec;
const blake3 = require('blake3');
const ec = new EC('secp256k1'); 

/*

Transaction Class

This class is a container for a single transaction. These transactions
will be added to a Block and when verified be posted on the Blockchain. 
The sender, receiver, and amount are set when a Transaction object is
instantiated, however the main verification comes from:
    receiveSignature()
        This function simply sets the signature of the Transaction object.

    verifyTransaction()
        Once the signature has been set, we can use the ec library to verify 
        that the sender's public key matches that of the signature.
        
There is an exception where we use:
    verifyCA()
        This function checks if the signature matches
        the globally available Central Authority public key


*/

class Transaction {
    constructor(senderID, receiverID, amount){
        this.senderID = senderID;
        this.receiverID = receiverID;
        this.amount = amount;
        this.date = Date.now();
        this.nonce = Math.floor(Math.random * 10000);
        this.hash = this.calculateHash();
        this.timeWait = 2000;
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

    toString2() {
        let transactionString = 'From: ' + this.senderID + ', To: ' + this.receiverID + ', amt: ' + this.amount;
        return transactionString;
    }

    toString3() {
        let transactionString = 'Transaction from ' + this.senderID + ' to ' + this.receiverID + ' for amount of ' + this.amount + ' created at time ' + this.date + ' with nonce of ' + this.nonce;
        return transactionString;
    }

}
module.exports = Transaction