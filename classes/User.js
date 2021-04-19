const Wallet = require('./Wallet');
const Block = require('./Block');

/*

User Class

This class acts as a container for a user's personal activities and info.

In this case, a user's wallet and their ability to mine a block if they
choose to. 

*/

class User {
    constructor() {
        this.wallet = new Wallet();
        this.userID = this.wallet.publicKey;
    }

    mineNextBlock() {
        var block = new Block(DACoin.getHeadHash());
        block.addTransactionsFromNode(DACoinNode);
        block.mineBlock(this.wallet.publicKey, DACoin);
        DACoin.addBlock(block);
    }
}

module.exports = User