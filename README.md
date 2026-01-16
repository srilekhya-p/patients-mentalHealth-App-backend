### INSTALL NODE.JS

### Initialize npm (if not already done)

If you don’t have a `package.json` file in that folder, run:

`
npm init -y
` 

----------

### 🧩  Install Express

`
npm install express
` 

This will create a `node_modules` folder and add `express` to your dependencies.

----------

### 🧩 Run your app again

`
node server.js
` 

----------
## Install the required packages

In your backend folder:
.env file should have following
`
AWS_ACCESS_KEY_ID=

AWS_SECRET_ACCESS_KEY=

S3_BUCKET_NAME=med-health-files

AWS_REGION=

MONGO_URL=
`

-------
## Run automated Unit tests with Jest 
MongoMemoryServer is the correct choice for fast, safe, isolated automated unit 
testing for db purpose
- Your real database wont get modified
- As Your tests will: insert fake users, insert fake medical history,delete files, delete users, mock passwords

run 
`
npm test
`
