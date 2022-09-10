const jsonschema =  require('jsonschema')

const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const { BadRequestError } = require('../expressError')
const { createToken } = require('../helpers/token')
const userAuthSchema = require('../schemas/userAuth.json')
const userRegisterSchema = require('../schemas/userRegister.json')


router.post("/token", async function(req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, userAuthSchema)
        if(!validator.valid) {
            const errors = validator.errors.map(e => e.stack)
            throw new BadRequestError(errors)
        }

        const { username, password } = req.body
        const user = await User.authenticate(username, password)
        const token = createToken(user)
        return res.json({ token })
    } catch(error) {
        return next(error)
    }
})

router.post('/register', async function(req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, userRegisterSchema)
        if(!validator.valid) {
            const errors = validator.errors.map(e => e.stack)
            throw new BadRequestError(errors)
        }

        const newUser = await User.register({ ...req.body, isAdmin: false })
        const token = createToken(newUser)
        return res.status(201).json({ token })
    } catch(error) {
        return next(error)
    }
})

module.exports = router;
