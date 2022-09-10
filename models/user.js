const db = require('../db')
const bcrypt = require('bcrypt')
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
} = require('../expressError')

const { BCRYPT_WORK_FACTOR } = require('../config')

const { sqlForPartialUpdate } = require('../helpers/sql')

class User {
    static async authenticate(username, password) {
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name,
                    last_name,
                    email,
                    is_admin
             FROM users
             WHERE username = $1`,
             [username]
        )

        const user = result.rows[0]

        if(user) {
            const isValid = await bcrypt.compare(password, user.password)
            if(isValid === true) {
                delete user.password
                return user
            }
        }

        throw new UnauthorizedError('Invalid username/password')
    }

    static async register({username, password, email, first_name, last_name, is_admin}) {
        const duplicateCheck = await db.query(
            `SELECT username
             FROM users
             WHERE username = $1`,
             [username]
        )

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`)
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)

        const result = await db.query(
            `INSERT INTO users
            (username,
             password,
             email,
             first_name,
             last_name,
             is_admin)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING username, email, first_name, last_name, is_admin`,
            [username, hashedPassword, email, first_name, last_name, is_admin === true]
        )

        return result.rows[0]
    }

    static async getAll() {
        const result = await db.query(
            `SELECT username,
                    first_name,
                    last_name,
                    email,
                    is_admin
             FROM users
             ORDER BY username`,
        )

        return result.rows;
    }

    static async get(username) {
        const result = await db.query(
            `SELECT username,
                    first_name,
                    last_name,
                    email,
                    is_admin
            FROM users
            WHERE username = $1`,
            [username]
        )

        const user = result.rows[0]

        if(!user) throw new NotFoundError(`User not found: ${username}`)

        const userOrdersRes = await db.query(
            `
                SELECT o.dish_id
                FROM orders AS o
                WHERE o.username = $1
            `, [username]
        )
        user.orders = userOrdersRes.rows.map(o => o.dish_id)

        return user
    }

    static async update(username, data) {
        if (data.password) {
          data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }
    
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
              firstName: "first_name",
              lastName: "last_name",
              isAdmin: "is_admin",
            });
        const usernameVarIdx = "$" + (values.length + 1);
    
        const querySql = `UPDATE users 
                          SET ${setCols} 
                          WHERE username = ${usernameVarIdx} 
                          RETURNING username,
                                    first_name,
                                    last_name,
                                    email,
                                    is_admin`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];
    
        if (!user) throw new NotFoundError(`No user: ${username}`);
    
        delete user.password;
        return user;
    }

    static async remove(username) {
        let result = await db.query(
              `DELETE
               FROM users
               WHERE username = $1
               RETURNING username`,
            [username],
        );
        const user = result.rows[0];
    
        if (!user) throw new NotFoundError(`No user: ${username}`);
    }

    static async orderDish(username, dish_id) {
        const preCheck = await db.query(
            `SELECT id
            FROM dishes
            WHERE id=$1`, [dish_id]
        )
        const dish = preCheck.rows[0]

        if(!dish) throw new NotFoundError(`No dish: ${dish_id}`)

        const preCheck2 = await db.query(
            `SELECT username
             FROM users
             WHERE username = $1
            `, [username]
        )
        const user = preCheck2.rows[0]

        if(!user) throw new NotFoundError(`No username: ${username}`)

        await db.query(
            `INSERT INTO orders (username, dish_id)
            VALUES ($1, $2)`, [username, dish_id]
        )
    }
}

module.exports = User