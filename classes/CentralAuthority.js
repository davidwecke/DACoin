var EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 
const Transaction = require('./Transaction');

class CentralAuthority {
    constructor() {
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
        this.CAKey = this.publicKey;
        this.registeredUsers = [];
    }

    registerUser(userID, userSSN) {
        const userObj = {userID, userSSN};
        this.registeredUsers.push(userObj);
    }

    createTransaction(userID, userSSN, receiverID, node, blockchain) {
        if(this.registeredUsers.find( function findUser(userObj) {
            return userObj.userID === userID && userObj.userSSN === userSSN;
        })) {
            // Create transaction on their behalf
            // Missing a getAvailableCoins functionality
            var transaction = new Transaction(userID, receiverID, blockchain.getAvailableCoins(userID));
            var sig = this.key.sign(transaction.getHash());
            var sigHex = sig.toDER('hex');
            transaction.receiveSignature(sigHex);
            node.addTransaction(transaction, blockchain);
        } else {
            console.log('User was not verified by CA');
        }
    }

    rejectTransaction(userID, userSSN) {
        if(this.registeredUsers.find( function findUser(userObj) {
            return userObj.userID === userID && userObj.userSSN === userSSN;
        })) {
            // Reject Transaction
            node.rejectTransaction(userID, this.privateKey);
        }
    }
}

module.exports = CentralAuthority