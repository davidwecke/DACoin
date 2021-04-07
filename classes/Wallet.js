var EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 
const Transaction = require('./Transaction');

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

    createTransaction(receiverID, amount, node, blockchain) {
        var transaction = new Transaction(this.publicKey, receiverID, amount);
        var sig = this.sign(transaction.getHash());
        transaction.receiveSignature(sig);
        node.addTransaction(transaction, blockchain);
    }
}

module.exports = Wallet