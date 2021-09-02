// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Constants
const PORT = 8349;
const HOST = "0.0.0.0";

// Hyperledger Bridge
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

const walletPath = path.join(process.cwd(), 'wallet');




app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ejs view template
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Index page
app.get('/', function (req, res) {
    res.render('index', { title: "Main Page", activate: "index"});
});

// Qeury all cars page
app.get('/queryallcars', function (req, res) {
    res.render('query', { title: "Query", activate: "query" });
});
// Create car page
app.get('/createcar', function (req, res) {
    res.render('createcar', { title: "Create Car", activate: "createcar"  });
});

// Change car owner page
app.get('/querycar', function (req, res) {
    res.render('querycar', { title: "Change Owner", activate: "querycar" });
});

app.get('/GetCarHistory', function (req, res) {
    res.render('GetCarHistory', { title: "Change Owner", activate: "GetCarHistory" });
});

// Change car owner page
app.get('/changeowner', function (req, res) {
    res.render('changeowner', { title: "Change Owner", activate: "changeowner" });
});


app.get('/api/querycars', async function (req, res) {
    var wallet = await Wallets.newFileSystemWallet(walletPath);
    const userExists = await wallet.get('appUser');
    if (!userExists) {
        console.log('An identity for the user "appUser" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true} });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('fabcar');
    const result = await contract.evaluateTransaction('queryAllCars');
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    var obj = JSON.parse(result)
    res.json(obj)
});

// localhost:8080/api/querycar?carno=CAR5
app.get('/api/querycar/', async function (req, res) {
    try {
	var carno = req.query.carno;
	console.log(carno);
    var wallet = await Wallets.newFileSystemWallet(walletPath);
    const userExists = await wallet.get('appUser');
        if (!userExists) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        const result = await contract.evaluateTransaction('queryCar', carno);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json(error);
    }
});


app.get('/api/GetCarHistory/', async function (req, res) {
    try {
	var carNumber = req.query.carNumber;
	console.log(carNumber);
    var wallet = await Wallets.newFileSystemWallet(walletPath);
    const userExists = await wallet.get('appUser');
        if (!userExists) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        const result = await contract.evaluateTransaction('GetCarHistory', carNumber);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json(error);
    }
});


app.post('/api/createcar/', async function (req, res) {
    try {
	var carno = req.body.carno;
	var colour = req.body.colour;
	var make = req.body.make;
	var model = req.body.model;
	var owner = req.body.owner;
    var wallet = await Wallets.newFileSystemWallet(walletPath);        
        const userExists = await wallet.get('appUser');
        if (!userExists) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true } }); 
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');

        await contract.submitTransaction('createCar', carno, make, model, colour, owner);
        console.log('Transaction has been submitted');
        await gateway.disconnect();

        res.status(200).json({response: 'Transaction has been submitted'});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }   

});

app.post('/api/changeowner/', async function (req, res) {
    try {
        var carno = req.body.carno;
        var owner = req.body.owner;
        var wallet = await Wallets.newFileSystemWallet(walletPath);
        const userExists = await wallet.get('appUser');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true } }); 

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        await contract.submitTransaction('changeCarOwner', carno, owner);
        console.log('Transaction has been submitted');
        await gateway.disconnect();
        res.status(200).json({response: 'Transaction has been submitted'});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }   
});

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
