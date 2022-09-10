const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testDishIds = []

async function commonBeforeAll() {
    await db.query('DELETE FROM users')
    await db.query('DELETE FROM dishes')

    const resultsDishes = await db.query(`
        INSERT INTO dishes(id, title, description, price, dish_url)
        VALUES  (1, 'D1', 'Dish 1', 1, 'http://d1.img'),
                (2, 'D2', 'Dish 2', 2, 'http://d2.img'),
                (3, 'D3', 'Dish 3', 3, 'http://d3.img')
        RETURNING id
    `)
    testDishIds.splice(0, 0, ...resultsDishes.rows.map(r => r.id))

    await db.query(`
        INSERT INTO users(username, email, password, first_name, last_name)
        VALUES  ('u1', 'u1@email.com', $1, 'u1f', 'u1l'),
                ('u2', 'u2@email.com', $2, 'u2f', 'u2l')
        RETURNING username
    `, [
        await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
        await bcrypt.hash('password2', BCRYPT_WORK_FACTOR),
    ])

    await db.query(`
        INSERT INTO orders(username, dish_id)
        VALUES ('u1', $1)
    `, [testDishIds[0]])
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testDishIds
}
