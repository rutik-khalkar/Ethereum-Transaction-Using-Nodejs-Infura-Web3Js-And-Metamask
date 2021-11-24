const express = require('express')
const app = express()
const PORT = 3000
const bodyParser = require('body-parser')
const TransactionRouter = require('./api/routes/transactions')
const BalanceRouter = require('./api/routes/balances');
const Mail = require('./api/routes/mail')
const ConfirmRouter = require('./api/routes/Confirmation');
require('dotenv').config();
require('./config/database').connect() 


app.use(express.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use('/api', TransactionRouter);
app.use('/api', BalanceRouter);
app.use('/api', Mail);
app.use('/api', ConfirmRouter);


app.listen(PORT, () => {
    console.log(`Server running on PORT : ${PORT}`);
});