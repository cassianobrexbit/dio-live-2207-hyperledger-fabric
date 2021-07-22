'use strict';

var express = require('express');
var app = express();
var fs = require('fs');

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

var ccp = null;
var caClient = null;
var wallet = null;
var gateway = null;
var contract = null;
var network = null;

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/initledger', async function (req, res) {

	try {
		// Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
		// This type of transaction would only be run once by an application the first time it was started after it
		// deployed the first time. Any updates to the chaincode deployed later would likely not need to run
		// an "init" type function.
		await contract.submitTransaction('InitLedger');
		
	} catch (error) {
		res.send('Fail to init ledger', error)
	}
	res.send('Ledger initialized')
});

app.post('/insertasset', async function (req, res) {

	var data = req.body;

	try {
		console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
		var result = await contract.submitTransaction('CreateAsset', data.assetId, data.assetColor, data.assetSize, data.assetOwner, data.assetValue);
		if (`${result}` !== '') {
			res.send(prettyJSONString(result.toString()))
		}
	} catch (error) {
		res.send('Fail to insert asset.')
	}

});

app.put('/transferasset', async function (req, res) {
	
	var data = req.body;

	try {
		await contract.submitTransaction('TransferAsset', data.assetId, data.newOwner);
		res.send('Asset transferido com sucesso')
		
	} catch (error) {
		res.send('Fail to transfer asset.')
	}
})

app.get('/getassets', async function(req, res){

	try {
		// Let's try a query type operation (function).
		// This will be sent to just one peer and the results will be shown.
		let result = await contract.evaluateTransaction('GetAllAssets');
		res.send(prettyJSONString(result.toString()))
		
	} catch (error) {
    res.send('Fail to get assets.')
	}
});

app.get('/getasset/:id', async function(req,res){

	try {
		let result = await contract.evaluateTransaction('ReadAsset', req.params.id);
		res.send(prettyJSONString(result.toString()))
	} catch (error) {
		res.send('Asset not found')
	}

})

app.put('/updateasset/:id', async function(req,res){

 	var data = req.body;
 	console.log(req.body)

 	try {
 		let result = await contract.submitTransaction('UpdateAsset', req.params.id, data.assetColor, data.assetSize, data.assetOwner, data.assetValue);
 		res.send('Asset updated')
 	} catch (error) {
 		console.log(error)
 		res.send('Fail to update asset')
 	}

})

var server = app.listen(8000, async function(){
	var host = server.address().address
	var port = server.address().port

	console.log("Server running at http://%s:%s", host, port)

	gateway = new Gateway();

	try {
		
		// build an in memory object with the network configuration (also known as a connection profile)
		ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		await enrollAdmin(caClient, wallet, mspOrg1);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// setup the gateway instance
		// The user will now be able to create connections to the fabric network and be able to
		// submit transactions and query. All transactions submitted by this gateway will be
		// signed by this user using the credentials stored in the wallet.
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
		});

		// Build a network instance based on the channel where the smart contract is deployed
		network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		contract = network.getContract(chaincodeName);


	} catch (error) {
		console.error(`******** Fail to start server: ${error}`);
	}

})
