const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 8000; // Change the port number if needed

app.use(express.static('public'));

const conn = mysql.createConnection({
  host:'127.0.0.1',
  user:'root',/*this creates a connection just like pool up above but uses an inbuilt function from the mysql module you've included*/
  password:null,
  database: 'todo_app',/*this database has to be existing */
})

/*this is a function that uses the connection you created to connect to your db*/
conn.connect((err) =>{
    if (err){
      console.log("Cannot connect to database")
    }
    else
    {
      console.log("Connected to database successfully")
    }
})

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      title VARCHAR(300) NOT NULL,
      content VARCHAR(300) NOT NULL,
      category VARCHAR(300) NOT NULL,
      done BOOLEAN DEFAULT false
    )
  `;

// Execute the query to create the table
conn.query(createTableQuery, (queryError) => {
  if (queryError) {
    console.error('Error executing query:', queryError);
    return;
  }

  console.log('Table created successfully.');
});

// Middleware to parse JSON requests
app.use(express.json());

// Create a new todo
app.post('/todos', (req, res) => {
  const now = new Date();
  let orderId = 0;
  const { title, content, category } = req.body;

  const query = 'INSERT INTO todos (order_id, created_at, updated_at, title, content, category) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [orderId, now, now, title, content, category];

  const maxOrderIdQuery = 'SELECT MAX(order_id) AS max_order_id FROM todos';
  conn.query(maxOrderIdQuery, (error, result) => {
    if (error) {
      console.error('Failed to get max order id:', error);
      res.status(404).json({ error: 'Failed to get max order id' });
      return;
    }
    const orderId = result[0].max_order_id + 1;
    console.log("Incremented the order id to", orderId);
    values[0] = orderId;

    conn.query(query, values, (error, result) => {
      if (error) {
        console.error('Failed to create todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
        return;
      }
  
      res.json(result);
    });
  });
});

// Get all todos
app.get('/todos', (req, res) => {
  const query = 'SELECT * FROM todos ORDER BY order_id DESC';

  conn.query(query, (error, results) => {
    if (error) {
      console.error('Failed to fetch todos', error);
      res.status(500).json({ error: 'Failed to fetch todos' });
    } else {
      res.json(results);
      console.log(results);
    }
  });
});

// Update a todo
app.put('/todos/:id', (req, res) => {
  const { title, content, category, done } = req.body;
  const { id } = req.params;
  const now = new Date();

  const query = 'UPDATE todos SET updated_at = ?, title = ?, content = ?, category = ?, done = ? WHERE id = ?';
  const values = [now, title, content, category, done, id];
  
  conn.query(query, values, (error, result) => {
    if (error) {
      console.error('Failed to update todo', error);
      res.status(500).json({ error: 'Failed to update todo' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Todo not found' });
    } else {
      res.json(result);
    }
  });
});

// Bulk update endpoint
app.post('/todos/update_order', (req, res) => {
  const todos = req.body; // Array of todos with updated data

  // Prepare the SQL statement
  let sql = 'UPDATE todos SET order_id = CASE id ';

  // Create an array to store the values for each todo update
  const values = [];

  // Build the SQL statement and values array
  todos.forEach(todo => {
    const { id, order_id } = todo;
    sql += `WHEN ${id} THEN ? `;
    values.push(order_id);
  });

  sql += 'END WHERE id IN (?)';

  const ids = todos.map(todo => todo.id);
  values.push(ids);

  // Execute the bulk update operation
  conn.query(sql, values, (error, results) => {
    if (error) {
      console.error('Failed to update todos', error);
      res.status(500).json({ error: 'Failed to update todos' });
    } else {
      res.json({ message: 'Todos updated successfully' });
    }
  });
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM todos WHERE id = ?';
  const values = [id];

  conn.query(query, values, (error, result) => {
    if (error) {
      console.error('Failed to delete todo', error);
      res.status(500).json({ error: 'Failed to delete todo' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Todo not found' });
    } else {
      res.json({ message: 'Todo deleted successfully' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
