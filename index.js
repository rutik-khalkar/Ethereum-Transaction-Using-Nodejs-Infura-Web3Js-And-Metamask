const express = require('express')
const app = express()
const PORT = 3000
const TransactionRouter = require('./api/routes/transactions')
const BalanceRouter = require('./api/routes/balances');
require('dotenv').config();
require('./config/database').connect() 


app.use(express.json())

app.use('/api', TransactionRouter);
app.use('/api', BalanceRouter);

app.post('/', function (req, res) {
    const {name, age} = req.body;
    res.send(`Your name is : ${name}, \n Your age is ${age}`)
})

app.listen(PORT, () => {
    console.log(`Server running on PORT : ${PORT}`);
});