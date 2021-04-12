var EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 
const Transaction = require('./Transaction');

class CentralAuthority {
    constructor() {
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
        this.registeredUsers = new Map;
    }

    registerUser(userPubK, userSSN) {
        this.registeredUsers.set(userSSN, userPubK);
    }

    requestIdChange(userID, userSSN, newUserID) {
        if(this.registeredUsers.get(userSSN) === userID) {
            // Create transaction on their behalf
            this.registeredUsers.set(userSSN, newUserID);
        } else {
            console.log('UserID change request denied. User could not be verified.');
        }
    }

    requestTransfer(userID, userSSN, receiverID) {
        if(this.registeredUsers.get(userSSN) === userID) {
            // Create transaction on their behalf
            console.log(DACoin.getAvailableCoins(userID));
            var transaction = new Transaction(userID, receiverID, DACoin.getAvailableCoins(userID));
            var sig = this.key.sign(transaction.getHash());
            var sigHex = sig.toDER('hex');
            transaction.receiveSignature(sigHex);
            DACoinNode.addTransaction(transaction, DACoin);
        } else {
            console.log('User was not verified by CA');
        }
    }

    rejectTransaction(userID, userSSN) {
        if(this.registeredUsers.get(userSSN) === userID){
            // Reject Transaction
            DACoinNode.rejectTransaction(userID, this.privateKey);
        }
    }
}

module.exports = CentralAuthority