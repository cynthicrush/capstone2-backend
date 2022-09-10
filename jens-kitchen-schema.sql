CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    -- price NUMERIC CHECK (price >= 0),
    price NUMERIC,
    dish_url TEXT
);

CREATE TABLE orders (
    username VARCHAR(25)
        REFERENCES users ON DELETE CASCADE,
    dish_id INTEGER
        REFERENCES dishes ON DELETE CASCADE,
    PRIMARY KEY (username, dish_id)
);