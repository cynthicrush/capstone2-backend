const { NotFoundError, BadRequestError, UnauthorizedError, ExpressError } = require("../expressError");
const db = require("../db.js");
const User = require('./user')
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

describe('authenticate', function() {
    test('works', async function() {
        const user = await User.authenticate('u1', 'password1')
        expect(user).toEqual({
            username: 'u1',
            email: 'u1@email.com',
            first_name: 'u1f',
            last_name: 'u1l',
            is_admin: false
        })
    })

    test("unauth if no such user", async function () {
        try {
            await User.authenticate("nope", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if wrong password", async function () {
        try {
            await User.authenticate("c1", "wrong");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
})

describe('register', function() {
    const newUser = {
        username: 'New',
        email: 'newUser@email.com',
        first_name: 'Test',
        last_name: 'User',
        is_admin: false 
    }

    test("works", async function () {
        let user = await User.register({
            ...newUser,
            password: "password",
        });
        expect(user).toEqual(newUser);
        const found = await db.query("SELECT * FROM users WHERE username = 'New'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("works: adds admin", async function () {
        let user = await User.register({
            ...newUser,
            password: "password",
            is_admin: true,
        });
        expect(user).toEqual({ ...newUser, is_admin: true });
        const found = await db.query("SELECT * FROM users WHERE username = 'New'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(true);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with dup data", async function () {
        try {
            await User.register({
                ...newUser,
                password: "password",
            });
            await User.register({
                ...newUser,
                password: "password",
            });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
})

describe("getAll", function () {
    test("works", async function () {
      const users = await User.getAll();
      expect(users).toEqual([
        {
          username: "u1",
          email: "u1@email.com",
          first_name: "u1f",
          last_name: "u1l",
          is_admin: false,
        },
        {
          username: "u2",
          first_name: "u2f",
          last_name: "u2l",
          email: "u2@email.com",
          is_admin: false,
        },
      ]);
    });
});

describe("get", function () {
    test("works", async function () {
        let user = await User.get("u1");
        expect(user).toEqual({
            username: "u1",
            first_name: "u1f",
            last_name: "u1l",
            email: "u1@email.com",
            is_admin: false,
            orders: [testDishIds[0]],
      });
    });
  
    test("not found if no such user", async function () {
        try {
            await User.get("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe('update', function(){
    const updateData = {
        email: 'new@email.com',
        first_name: 'Newf',
        last_name: 'Newl',
        is_admin: true
    }

    test("works", async function () {
        let user = await User.update("u1", updateData);
        expect(user).toEqual({
            username: "u1",
            ...updateData,
        });
    });

    test("works: set password", async function () {
        let user = await User.update("u1", {
            password: "new",
        });
        expect(user).toEqual({
            username: "u1",
            first_name: "u1f",
            last_name: "u1l",
            email: "u1@email.com",
            is_admin: false,
        });
        const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("not found if no such user", async function () {
        try {
            await User.update("nope", {
                firstName: "test",
            });
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    
    test("bad request if no data", async function () {
        expect.assertions(1);
        try {
            await User.update("c1", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
})

describe("remove", function () {
    test("works", async function () {
        await User.remove("u1");
        const res = await db.query(
            "SELECT * FROM users WHERE username='u1'");
        expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such user", async function () {
        try {
            await User.remove("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe('orderDish', function() {
    test('works', async function() {
        await User.orderDish('u1', testDishIds[1])

        const response = await db.query(
            'SELECT * FROM orders WHERE dish_id=$1', [testDishIds[1]]
        )
        expect(response.rows).toEqual([{
            dish_id: testDishIds[1],
            username: 'u1'
        }])
    })
    
    test("not found if no such dish", async function () {
        try {
            await User.orderDish("u1", 0, "ordered");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    
    test("not found if no such user", async function () {
        try {
            await User.orderDish("nope", testDishIds[0], "ordered");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})