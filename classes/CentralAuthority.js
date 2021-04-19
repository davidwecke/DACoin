var EC = require('elliptic').ec;
const ec = new EC('secp256k1'); 
const Transaction = require('./Transaction');
const blake3 = require('blake3');

/*

CentralAuthority Class

The Central Authority class allows users to register to the CA and then
have the CA make transactions on their behalf. This is done by sending 
some form of private information that only the user would have access to.

In our example this is their SSN and a signature. 

This whole system is done through two main functions:

    registerUser()
        Registers a user to the CA, using their SSN and their public key and a valid signature. 
    requestTransfer()
        Registered users can then request a transfer out of their account without needing access
        to their private key. 

*/

class CentralAuthority {
    constructor() {
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
        this.registeredUsers = new Map;
    }

    registerUser(userPubK, userSSN, signature) {
        var tempKey = ec.keyFromPublic(userPubK, 'hex');
        if(tempKey.verify(userSSN, signature)) {
            this.registeredUsers.set(userSSN, userPubK);
            console.log('Successfully registered user with public key: ' + userPubK);
        } else {
            console.log('User not registered, signature does not match. ');
        }
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
            var transaction = new Transaction(userID, receiverID, DACoin.getAvailableCoins(userID));
            var sig = this.key.sign(transaction.getHash());
            var sigHex = sig.toDER('hex');
            transaction.receiveSignature(sigHex);
            DACoinNode.addTransaction(transaction, DACoin);
            console.log('User successfully verfied, transfer request added to the queue!');
        } else {
            console.log('Transfer request denied, user could not be verified.');
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