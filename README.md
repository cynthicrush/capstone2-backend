JEN'S KITCHEN


DESCRIPTION:

  Link to the project: https://second-hand-discovery.surge.sh/
  Jen's Kitchen is an restauant app that allows people to view all the dishes and to order dishes. 
  It is a JavaScript app. It used express.js for the backend and react.js for the frontend.
  Future Features: An "My Order" route, search for dishes.


HOW TO INSTALL AND RUN THE PROJECT:

  To install all the frameworks: $ npm install
  Run backend server locally: $ nodemon server.js
  Run frontend server locally: $ npm start
  Database: jens_kitchen and jens_kitchen_test


HOW TO USE THE PROJECT: 

  Go to /dishes to view all the dishes.
  Sign up an account to order dishes. (Username, Email, Password, First Name, Last Name)
  Log in feature for users to log in. (Username, Password)
  An "Add to Order" button to add dishes to your order. (Only when you logged in)

DATABASE TABLES:
  
  users: username, email, password, first_name, last_name, id_admin
  dishes: id, title, description, price, dish_url
  orders: username, dish_id, PRIMARY KEY (username, dish_id) 
