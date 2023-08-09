import express from 'express';
const app = express ()
import bcrypt from 'bcrypt';

app.use(express.json())

const users = []

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', async(req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { name: req.body.name, password: hashedPassword}
        users.push(user)
        res.status(201).send({ user: { name: user.name ,hasedPassword: user.password} });
    } catch {
        res.status(500).send()
    }
    

})

app.post('/users/login', async(req, res) => {
    const user = users.find(user => user.name = req.body.name)
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try{
        if(await bcrypt.compare(req.body.password, user.password)) {
            res.send('Sucess')
        } else {
            res.send('Not Authorized')
        }

    } catch{
        res.status(500).send()
    }
})

app.listen(3000)