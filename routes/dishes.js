const jsonschema = require('jsonschema')

const express = require('express')
const { BadRequestError } = require('../expressError')
const Dish = require('../models/dish')
const dishNewSchema = require('../schemas/dishNewSchema.json')
const dishUpdateSchema = require('../schemas/dishUpdate.json')
const {ensureAdmin, ensureCorrectUserOrAdmin} = require('../middleware/auth')

const router = express.Router()

router.post('/', async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, dishNewSchema)
        if(!validator.valid) {
            const errors = validator.errors.map(e => e.stack)
            throw new BadRequestError(errors)
        }
        const dish = await Dish.create(req.body)
        return res.status(201).json({ dish })
    } catch(error) {
        return next(error)
    }
})

router.get('/', async function(req, res, next) {
    // try {
    //     const validator = jsonschema.validate(req.query, dishNewSchema)
    //     if(!validator.valid) {
    //         const errors = validator.errors.map(e => e.stack)
    //         throw new BadRequestError(errors)
    //     }
    //     const dishes = await Dish.getAll()
    //     return res.json({ dishes })
    // } catch(error) {
    //     return next(error)
    // }

    const dishes = await Dish.getAll()
    return res.json({ dishes })
})

router.get('/:id', async function(req, res, next) {
    try{
        const dish = await Dish.get(req.params.id)
        return res.json({ dish })
    } catch(error) {
        return next(error)
    }
})

router.patch('/:id', ensureAdmin, async function(req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, dishUpdateSchema)
        if(!validator.valid) {
            const errors = validator.errors.map(e => e.stack)
            throw new BadRequestError(errors)
        }
        const dish = await Dish.update(req.params.id, req.body)
        return res.json({ dish })
    } catch(error) {
        return next(error)
    }
})

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
      await Dish.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
});


module.exports = router;
