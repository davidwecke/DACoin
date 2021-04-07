const Block = require('./Block');
const Transaction = require('./Transaction');

class Blockchain {
    constructor() {
        this.blockchain = [];
        this.miningReward = 100;
        // Create genesis block
        this.createGenesisBlock();
    }

    getAvailableCoins(publicAddress) {
        var funds = 0.0;
        this.blockchain.forEach(function(block, index, blockchain){
            block.transactionList.forEach(function(transaction, index, transactionList){
                if(transaction.receiverID === publicAddress) {
                    funds += transaction.amount;
                } else if(transaction.senderID === publicAddress) {
                    funds -= transaction.amount;
                }
            }, this);
        }, this);
        return funds;
    }

    createGenesisBlock() {
        var genesisBlock = new Block('Genesis Block, no previous hash.', 5);
        var genesisTransaction = new Transaction('david', 'alex', 0);
        genesisBlock.transactionList.push(genesisTransaction);
        genesisBlock.mineBlock('04c5861ec663323819981cccd7be76a4c3c494f55f9d2bf24d4cb562bef33837df8f59dd3f6626d4c485adfcfb3e09de91b3e66794af69587fc810ace7904d04f9', this); // Mine the block
        this.blockchain.push(genesisBlock);
    }

    getHeadHash() {
        if(this.blockchain.length !== 0) {
            return this.blockchain[this.blockchain.length-1].calculateHash();
        }
    }

    getHead() {
        if(this.blockchain.length !== 0) {
            return this.blockchain[this.blockchain.length-1];
        }
    }

    // Add a block to the blockchain
    addBlock(block, miningRewardAddress) {
        // Pass the verify function the blockchain
        if (block.verify(this.getHeadHash())) {
            // Valid block, add it
            console.log('Successfully added a block!');
            this.blockchain.push(block);
            this.checkMiningReward();
        }
    }

    checkMiningReward() {
        if(this.blockchain.length % 2 === 0) {
            this.miningReward = this.miningReward/2;
        }
    }

    verify() {
        for(var i = 1; i < this.blockchain.length; i++) {
            if(!this.blockchain[i].verify(this.blockchain[i-1].calculateHash())) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain