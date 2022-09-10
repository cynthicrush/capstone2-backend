const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Dish = require('./dish')
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testDishIds,
} = require("./_testCommon");
  
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('create', function() {
    const newDish = {
        id: 1111,
        title: 'Test',
        description: 'Test description',
        price: '111',
        dish_url: 'http://test.img'
    }

    test('works', async function() {
        let dish = await Dish.create(newDish)
        expect(dish).toEqual({
            ...newDish,
            id: expect.any(Number)
        })
    })
})

describe('findAll', function() {
    test('works: no filter', async function() {
        let dishes = await Dish.getAll()
        expect(dishes).toEqual([
            {
                id: testDishIds[0],
                title: 'D1',
                description: 'Dish 1',
                price: '1',
                dish_url: 'http://d1.img'
            },
            {
                id: testDishIds[1],
                title: 'D2',
                description: 'Dish 2',
                price: '2',
                dish_url: 'http://d2.img'
            },
            {
                id: testDishIds[2],
                title: 'D3',
                description: 'Dish 3',
                price: '3',
                dish_url: 'http://d3.img'
            },
        ])
    })
})

describe('get', function() {
    test('works', async function() {
        let dish = await Dish.get(testDishIds[0])
        expect(dish).toEqual({
            id: testDishIds[0],
            title: 'D1',
            description: 'Dish 1',
            price: '1',
            dish_url: 'http://d1.img'
        })
    })

    // test('not found if no such dish', async function() {
    //     try {
    //         await Dish.get(0)
    //         fail()
    //     } catch(err) {
    //         expect(err instanceof NotFoundError).toBeTruthy()
    //     }
    // })
})

describe('update', function() {
    let updateData = {
        title: 'New',
        description: 'New description',
        price: '9999'
    }
    test('works', async function() {
        let dish = await Dish.update(testDishIds[0], updateData)
        expect(dish).toEqual({
            id: testDishIds[0],
            dish_url: 'http://d1.img',
            ...updateData            
        })
    })

    test('not found if no such dish', async function() {
        try {
            await Dish.update(0, {
                title: 'test',
            })
            fail()
        } catch(err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })

    test('bad request with no data', async function() {
        try {
            await Dish.update(testDishIds[0], {})
            fail()
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy()
        }
    })
})

describe('remove', function() {
    test('works', async function(){
        await Dish.remove(testDishIds[0])
        const response = await db.query(
            'SELECT id FROM dishes WHERE id=$1', [testDishIds[0]]
        )
        expect(response.rows.length).toEqual(0)
    })

    test('not found if no such job', async function() {
        try {
            await Dish.remove(0)
            fail()
        } catch(err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})