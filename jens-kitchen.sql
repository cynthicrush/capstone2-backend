\echo 'Delete and recreate jens_kitchen db?'
\prompt 'Return for yes or control-C to cancel >' foo

DROP DATABASE jens_kitchen;
CREATE DATABASE jens_kitchen;
\connect jens_kitchen;

\i jens-kitchen-schema.sql;
\i jens-kitchen-seed.sql;

\echo 'Delete and recreate jens_kitchen_test db?'
\prompt 'Return for yes or control-C to cancel >' foo

DROP DATABASE jens_kitchen_test;
CREATE DATABASE jens_kitchen_test;
\connect jens_kitchen_test;

\i jens-kitchen-schema.sql
