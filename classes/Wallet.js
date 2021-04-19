var EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 
const Transaction = require('./Transaction');

/*

Wallet Class

This class creates a users public and private key pair.
It also takes care of signing transactions as well as creating
transactions on behalf of the users. The functions are:
    sign() and
    createTransaction()

which are self explanatory. 

*/

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

    createTransaction(receiverID, amount, node, blockchain) {
        var transaction = new Transaction(this.publicKey, receiverID, amount);
        var sig = this.sign(transaction.getHash());
        transaction.receiveSignature(sig);
        node.addTransaction(transaction, blockchain);
    }
}

module.exports = Wallet