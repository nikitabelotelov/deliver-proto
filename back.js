const express = require('express')
const cors = require('cors')
const app = express()

const port = 3001

app.use(cors())
app.use(express.static(__dirname + "/"));
 
app.listen(port);
console.log(`Backend now on ${port} port`)