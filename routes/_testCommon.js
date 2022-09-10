const db = require("../db.js");
const User = require("../models/user");
const Dishes = require('../models/dish')
const { createToken } = require('../helpers/token');
const { testDishIds } = require("../models/_testCommon.js");
const Dish = require("../models/dish");

const restDishIds = []

async function commonBeforeAll() {
    await db.query('DELETE FROM users')
    await db.query('DELETE FROM dishes')

    testDishIds[0] = (await Dish.create(
        {id: 0, title: 'd1', description: 'dish 1', price: 111, dish_url: 'http://d1.img'})).id
    testDishIds[1] = (await Dish.create(
        {id: 1, title: 'd2', description: 'dish 2', price: 222, dish_url: 'http://d2.img'})).id
    testDishIds[2] = (await Dish.create(
        {id: 2, title: 'd3', description: 'dish 3', price: 333, dish_url: 'http://d3.img'})).id

    await User.register({
        username: "u1",
        first_name: "U1F",
        last_name: "U1L",
        email: "user1@user.com",
        password: "password1",
        is_admin: false,
    });
    await User.register({
        username: "u2",
        first_name: "U2F",
        last_name: "U2L",
        email: "user2@user.com",
        password: "password2",
        is_admin: false,
    });
    await User.register({
        username: "u3",
        first_name: "U3F",
        last_name: "U3L",
        email: "user3@user.com",
        password: "password3",
        is_admin: false,
    });

    await User.orderDish('u1', testDishIds[0])
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


const u1Token = createToken({ username: "u1", is_admin: false });
const u2Token = createToken({ username: "u2", is_admin: false });
const adminToken = createToken({ username: "admin", is_admin: true });

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testDishIds,
    u1Token,
    u2Token,
    adminToken
}
