const express = require('express')

const app = express()

const post = 3000

app.get('/', (req, res) => {
    res.json(req)
})

app.listen(post, (err) => {
    if(err) console.error(err)
    console.log(`server running in post ${post}`)
})