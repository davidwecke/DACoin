const Block = require('./Block');
const Transaction = require('./Transaction');

/*

Blockchain Class

The main class of the project, the blockchain. This class holds a chain of blocks
which hold the transactions of users. Blocks are added to the chain using the:

    addBlock()

function, which checks the hash that the miners came up with and then adds it.

Every time a block is added to the chain, the:
    
    checkMiningReward()

function is called, which checks whether or not it is time to half
the current mining reward. This can be adjusted in this function and 
is very low in our small proof of concept project. 

The last major function is the:

    verify()

function, which goes through the entire blockchain and calculates all the hashes to
see if the blockchain is valid. 

*/


class Blockchain {
    constructor(creatorAddress) {
        this.blockchain = [];
        this.miningReward = 100;
        this.difficulty = 3;
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

    addBlock(block) {
        // Pass the verify function the blockchain
        if (block.verify(this.getHeadHash())) {
            // Valid block, add it. 
            this.blockchain.push(block);
            this.checkMiningReward();
        }
    }

    checkMiningReward() {
        if(this.blockchain.length % 3 === 0) {
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