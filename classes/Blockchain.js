const Block = require('./Block');
const Transaction = require('./Transaction');

class Blockchain {
    constructor(creatorAddress) {
        this.blockchain = [];
        this.miningReward = 100;
        // Create genesis block
        this.createGenesisBlock(creatorAddress);
    }

    getAvailableCoins(publicAddress) {
        var funds = 0.0;
        this.blockchain.forEach(function(block, index, blockchain){
            block.transactionList.forEach(function(transaction, index, transactionList){
                if(transaction.receiverID === publicAddress) {
                    funds += transaction.amount;
                }
                if(transaction.senderID === publicAddress) {
                    funds -= transaction.amount;
                }
            }, this);
        }, this);
        return funds;
    }

    createGenesisBlock(creatorAddress) {
        var genesisBlock = new Block('Genesis Block, no previous hash.', 5);
        var genesisTransaction = new Transaction('david', 'alex', 0);
        genesisBlock.transactionList.push(genesisTransaction);
        genesisBlock.mineBlock(creatorAddress, this); // Mine the block
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
        for(let i = 0; i < this.blockchain.length; i++) {
            if(!this.blockchain[i].verify()){
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain