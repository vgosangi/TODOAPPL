const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1 second
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  let getBooksQuery = "";
  switch (true) {
    case status !== "":
      getBooksQuery = `
                SELECT
                *
                FROM
                todo
                WHERE
                
                status = "${status}"
                
                `;
      break;
    case priority !== "":
      getBooksQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
    
     priority = "${priority}"
    `;
      break;
    case priority !== "" && status !== "":
      getBooksQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
    
     status = "${status}"
     and
     priority = "${priority}"
    `;
    case search_q !== "":
      getBooksQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
    todo LIKE '%${search_q}%'
     
    `;
  }

  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo 
    where
      id=${todoId};`;
  const todoArray = await db.all(getTodoQuery);
  response.send(todoArray[0]);
});
//API 3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `
    INSERT INTO
      todo (id,todo,priority,status)
    VALUES
      (
        ${id},
        '${todo}',
        ' ${priority}',
         '${status}'
         
      );`;

  const dbResponse = await db.run(addTodoQuery);

  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo = "", status = "", priority = "" } = request.body;

  let todoToUpdated = "";
  let todoItem = "";
  let Updated = "";
  switch (true) {
    case status !== "":
      todoItem = "status";
      todoToUpdated = status;
      Updated = "Status";
      break;
    case todo !== "":
      todoItem = "todo";
      todoToUpdated = todo;
      Updated = "Todo";
      break;
    case priority !== "":
      todoItem = "priority";
      todoToUpdated = priority;
      Updated = "Priority";
      break;
  }
  console.log(todoItem, todoToUpdated);
  const updateTodoQuery = `
      update
        todo
     SET
         ${todoItem}= "${todoToUpdated}"
    WHERE
        id = ${todoId};
        `;
  console.log(updateTodoQuery);
  const dbResponse = await db.run(updateTodoQuery);

  response.send(`${Updated} Updated`);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
