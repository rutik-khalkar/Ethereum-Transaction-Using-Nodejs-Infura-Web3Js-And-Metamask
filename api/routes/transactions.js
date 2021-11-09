const express = require('express');
const router = express.Router();
require('dotenv').config(); 
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction
const web3 = new Web3(process.env.INFURA)
const privateKey = Buffer.from( process.env.privateKey, 'hex');
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');


router.post('/transaction', async (req, res, next) => {
    const { sender,  receiver , value1 } = req.body;

    try {
        web3.eth.getTransactionCount(sender, (err, txCount) => {
    
            // Build the Transaction
            const txObject = {
                nonce : web3.utils.toHex(txCount),
                to : receiver,
                value: web3.utils.toHex(web3.utils.toWei(value1, 'ether')),
                gasLimit : web3.utils.toHex(21000),
                gasPrice : web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
            }
        
            //Sign the Transaction
            const tx = new Tx(txObject, { chain: 'ropsten' })
            tx.sign(privateKey)
        
            const serializedTransaction =tx.serialize()
            const raw ='0x'+serializedTransaction.toString('hex')
        
             //Broadcast the Transaction
            web3.eth.sendSignedTransaction(raw, (err,txHash) => {
                console.log('err:', err)
                console.log('txHash:', txHash)
                // res.status(200).json({
                //     'txHash:': txHash
                // })
                const transaction = new Transaction({
                    _id : new mongoose.Types.ObjectId,
                    sender : req.body.sender,
                    receiver : req.body.receiver,
                    value : req.body.value1,
                    gasLimit : txObject.gasLimit,
                    gasPrice : txObject.gasPrice,
                    Hash : txHash
                })
                try {
                    const t1 = transaction.save()
                    res.status(200).json({
                        Message : 'Transaction save successfully!',
                        transaction,
                    }) 
                } catch (error) {
                    res.status(404).json({
                        Message :'Unable to save transaction :',
                        error
                    })
                }
            })
        })
    } catch (error) {
        res.send(error)
    }
})

module.exports = router;