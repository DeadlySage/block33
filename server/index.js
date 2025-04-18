// imports
require('dotenv').config();

const express = require("express");
const app = express();
const PORT = 3000;
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);

app.use(express.json());
app.use(require("morgan")("dev"));
app.use((error, req, res, next) => {
  res.status(res.status || 500).send({ error: error });
})


// app routes
app.get("/", (req, res, next) => {
  res.status(200).json({
    status: 200,
    message: "API is working"
  });
})

app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * FROM employee;
    `
    const response = await client.query(SQL);

    res.status(200).json({
      status: 200,
      data: response.rows
    });

  } catch (error) {
    next(error);
  }
})

app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * FROM department;
    `
    const response = await client.query(SQL);

    res.status(200).json({
      status: 200,
      data: response.rows
    });
  } catch (error) {
    next(error);
  }
})

app.get("/api/employees/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const SQL = `
      SELECT employee.id AS id, 
        employee.name AS name, 
        employee.created_at, 
        employee.updated_at, 
        department.id AS department_id, 
        department.name AS department_name
      FROM employee 
      INNER JOIN department ON employee.department_id = department.id 
      WHERE employee.id = $1;
    `
    const response = await client.query(SQL, [id])
    if (response.rows.length !== 0) {
      res.status(201).json({
        status: 201,
        data: response.rows[0]
      })
    } else {
      res.status(404).json({
        status: 404,
        message: "Employee not found"
      })
    }
  } catch (error) {
    next(error);
  }
})

app.post("/api/employees", async (req, res, next) => {
  try {
    const name = req.body.name;
    const department_id = req.body.department_id;
    const SQL = `
      INSERT INTO employee(name, department_id) 
      VALUES($1, $2) 
      RETURNING *;
    `
    const response = await client.query(SQL, [name, department_id]);
    if (response.rowCount !== 0){
      res.status(201).json({
        status: 201,
        message: `succesfully added ${name} to department ${department_id}`
      })
    } else {
      res.status(400)
    }

  } catch (error) {
    next(error);
  }
}) 

app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const SQL = `
      DELETE FROM employee WHERE id = $1;
    `
    const response = await client.query(SQL, [id]);
    if (response.rowCount !== 0){
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
})

app.put("/api/employees/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const department_id = req.body.department_id;
    const SQL = `
      UPDATE employee
      SET name = COALESCE($2, name),
      updated_at = now(),
      department_id = COALESCE($3, department_id)
      WHERE id = $1 
      RETURNING *;
    `
    const response = await client.query(SQL, [id, name, department_id]);
    if(response.rowCount !== 0){
      res.status(201).json({
        status: 201,
        message: `succesfully updated employee ${id}`
      })
    } else {
      res.status(404).json({
        status: 404,
        message: `employee ${id} does not exist`
      })
    }
    
  } catch (error) {
    next(error);
  }
})

// init function
const init = async () => {
  await client.connect();
  console.log('connected to database: ', process.env.DATABASE_URL);
  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

// call init function
init();