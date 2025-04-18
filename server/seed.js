// imports
require('dotenv').config();

const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);

// create department and employee tables
const init = async () => {
  await client.connect();

  const SQL = `
  DROP TABLE IF EXISTS department CASCADE;
  CREATE TABLE department(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80)
  );

  DROP TABLE IF EXISTS employee CASCADE;
  CREATE TABLE employee(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    department_id UUID REFERENCES department(id) NOT NULL
  );

  INSERT INTO department(name) VALUES('Frontend devs');
  INSERT INTO department(name) VALUES('Backendend devs');
  INSERT INTO department(name) VALUES('DevOps');
  INSERT INTO department(name) VALUES('Human Resources');
  INSERT INTO department(name) VALUES('Business analysts');
  INSERT INTO department(name) VALUES('Marketing');
  `

  await client.query(SQL);
  console.log("database seeded succesfully")
}

// call init function
init();
