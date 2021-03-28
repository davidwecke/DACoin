now = Date.now();

timeWait = 1000;

function checkTime() {
        if(now + timeWait <= Date.now()) 
    {
        console.log('We are good to go!');
    }else {
        console.log('We need to wait mroe.')
    }
}

setTimeout(() => {  checkTime(); }, 2000);

if(now + timeWait <= Date.now()) 
{
    console.log('We are good to go!');
}else {console.log('We need to wait mroe.')}

console.log(new Date(now));

console.log(new Date(now+timeWait));