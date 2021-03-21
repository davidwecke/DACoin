readyTransactions = [];

pendingCATransactions = ['0', '1', '2'];

pendingCATransactions.forEach(function(value, index, array) {
    if( value === '1' ) {
        // We have waited long enough, add tx to ready queue
        readyTransactions.push(array.splice(index, 1)[0]);
    }
})

console.log(readyTransactions);



console.log(pendingCATransactions);

console.log(pendingCATransactions.splice(0,pendingCATransactions.length));

console.log(pendingCATransactions);