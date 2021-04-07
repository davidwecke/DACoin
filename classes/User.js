const Wallet = require('./Wallet');

class User {
    constructor() {
        this.wallet = new Wallet();
        this.userID = this.wallet.publicKey;
    }
}

module.exports = User