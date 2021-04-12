var EC = require('elliptic').ec;
const blake3 = require('blake3');
const ec = new EC('secp256k1'); 


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
        //console.log('CAKey: ' + CAKey);
        var publicKey = ec.keyFromPublic(CAKey, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

    toString() {
        let transactionString = 'Transaction from ' + this.senderID + ' to ' + this.receiverID + ' for amount of ' + this.amount + ' created at time ' + this.date + ' with nonce of ' + this.nonce;
        return transactionString;
    }

}
module.exports = Transaction