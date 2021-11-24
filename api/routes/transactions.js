const express = require('express');
const router = express.Router();
require('dotenv').config(); 
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction
const web3 = new Web3(process.env.INFURA)
const privateKey = Buffer.from( process.env.privateKey, 'hex');
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');



router.post('/transaction', async (req, res, next) => {
    
    try {
        const { email, sender,  receiver , value1, name } = req.body;
        if (!(email && sender && receiver && value1)){
            res.status(400).send('All input field is requried!');
        }else{
            const em = email.match( /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)
            if(!(em)){
                res.send('Invalid Email')
            }else {
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
                        const transaction = new Transaction({
                            _id : new mongoose.Types.ObjectId,
                            email : email,
                            sender : sender,
                            receiver : receiver,
                            value : value1,
                            gasLimit : txObject.gasLimit,
                            gasPrice : txObject.gasPrice,
                            Hash : txHash
                        })

                        const token = jwt.sign(
                            {
                                transaction
                                
                            },
                            process.env.TOKEN_KEY,
                            {
                                expiresIn:"2h",
                            }
                        );
                        
                        const mail = nodemailer.createTransport({
                            service: 'gmail',
                            auth:{
                                user:process.env.USER,
                                pass:process.env.PASSWORD    
                            }
                        });
                        
                        const mailOptions = {
                            from: process.env.USER,
                            to: email,
                            subject: `Your Ethereum Transaction success!`,
                            html: `<!doctype html>
                            <html lang="en">
                              <head>
                                <!-- Bootstrap CSS -->
                                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css" integrity="sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn" crossorigin="anonymous">
                                <title>Hello, world!</title>
                                <style>
                                    .container{
                                        margin-top: 3%;
                                        /* text-align: center; */
                                        border-radius: 10px;
                                        border: 3px solid #3c3c3d;
                                        padding: 10px;
                                        position: fixed;
                                        top: 0;
                                        right: 0;
                                        left: 0;
                                        /* height: 46px; */
                                        z-index: 100;
                                    }
                                    .header{
                                        display: flex;
                                        margin-right: 20px;
                                        margin-left: 20px;
                                    }
                                    h1{
                                        display: inline;
                                    }
                                    h4{
                                        display: inline;
                                        float:right;
                                        font-weight: 400;
                                        font-size: 20px;
                                        margin-top: 25px;
                                    }
                                    .main{
                                        /* display: flexbox; */
                                        background-color: #f7f9fa;
                                        padding: 10px;
                                        margin-top: 30px;
                                    }
                                    table{
                                        margin-top: 20px;
                                    }
                                </style>
                              </head>
                              <body>
                                <div class="container">
                                   <header>
                                       <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7Y2ciUSipk4CK10FaWorqWfnCY0xQCFIGzA&usqp=CAU" alt="Ethereum logo" height="70" width="70">
                                       <h4>${Date()}</h4>
                                   </header>
                                   <div class="container-fluid">
                                       <div class="main">
                                            <b>Your Ethereum Transaction success!</b>
                                            <table class="table">
                                                <tr>
                                                    <td>Tnx. ID </td>
                                                    <td>: &nbsp;${transaction._id}</td>
                                                </tr>
                                                <tr>
                                                    <td>Tnx. Status </td>
                                                    <td style="color: #34a853;">: &nbsp; Successful</td>
                                                </tr>
                                                <tr>
                                                    <td>Sender Address </td>
                                                    <td>: &nbsp; ${sender}</td>
                                                </tr>
                                                <tr>
                                                    <td>Receiver Address </td>
                                                    <td>: &nbsp; ${receiver}</td>
                                                </tr>
                                                <tr>
                                                    <td>Amount </td>
                                                    <td>: &nbsp; ${value1}</td>
                                                </tr> 
                                                <tr>
                                                    <td>Gas Limit </td>
                                                    <td>: &nbsp; ${transaction.gasLimit}</td>
                                                </tr> 
                                                <tr>
                                                    <td>Gas Price </td>
                                                    <td>: &nbsp; ${transaction.gasPrice}</td>
                                                </tr> 
                                                <tr>
                                                    <td>Tnx.Hash </td>
                                                    <td>: &nbsp; https://ropsten.etherscan.io/tx/${txHash}</td>
                                                </tr> 
                                            </table>
                                       </div>
                                       <div class="wrapper">
                                           <p>Hi ${req.body.name}</p>
                                           <p>If you have not made this transaction or notice any error please contact us at <a href=" https://support.rutikkhalkar.com"> https://support.rutikkhalkar.com</a> </p>
                                           <p>Cheers! <br>
                                            Team Ethereum
                                           </p>
                                       </div>
                                   </div>
                                </div>
                            
                            
                                <!-- Option 1: jQuery and Bootstrap Bundle (includes Popper) -->
                                <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
                                <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-fQybjgWLrvvRgtW6bFlB7jaZrFsaBXjsOMm/tB9LTS58ONXgqbR9W8oWht/amnpF" crossorigin="anonymous"></script>
                            
                              </body>
                            </html>`
                        };
                        
                         
                        mail.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                            }
                            else{
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        try {
                            const t1 = transaction.save()
                            res.status(200).json({
                                token,
                                Message : 'Transaction save and Email send successfully!',
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
            }
        }
    } catch (error) {
        res.send(error)
    }
})

module.exports = router;

