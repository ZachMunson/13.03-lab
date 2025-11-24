var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
  try {
    req.db.query('SELECT * FROM todos;', (err, results) => {
      if (err) {
        console.error('Error fetching todos:', err);
        return res.status(500).send('Error fetching todos');
      }
      res.render('index', { title: 'My Simple TODO', todos: results, error: null });
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
});

router.post('/create', function (req, res, next) {
  const { task } = req.body;

  // Prevent blank task
  if (!task || !task.trim()) {
    return req.db.query('SELECT * FROM todos;', (err, results) => {
      return res.render('index', { title: 'My Simple TODO', todos: results, error: "Task cannot be blank" });
    });
  }

  try {
    req.db.query('INSERT INTO todos (task, completed) VALUES (?, false);', [task], (err, results) => {
      if (err) {
        console.error('Error adding todo:', err);
        return res.status(500).send('Error adding todo');
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).send('Error adding todo');
  }
});

router.post('/delete', function (req, res, next) {
  const { id } = req.body;
  try {
    req.db.query('DELETE FROM todos WHERE id = ?;', [id], (err, results) => {
      if (err) {
        console.error('Error deleting todo:', err);
        return res.status(500).send('Error deleting todo');
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).send('Error deleting todo:');
  }
});


router.post('/complete', function(req, res) {
  const { id, completed } = req.body;

  const newState = completed === "1" ? false : true;

  req.db.query(
    'UPDATE todos SET completed = ? WHERE id = ?;',
    [newState, id],
    (err, results) => {
      if (err) {
        console.error('Error updating task state:', err);
        return res.status(500).send('Error updating task state');
      }
      res.redirect('/');
    }
  );
});



// Display edit page
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  req.db.query('SELECT * FROM todos WHERE id = ?;', [id], (err, results) => {
    if (err) return res.status(500).send("Error loading edit page");
    res.render("edit", { todo: results[0], error: null });
  });
});

// Apply edit
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const updatedTask = req.body.task;

  if (!updatedTask.trim()) {
    return req.db.query('SELECT * FROM todos WHERE id = ?;', [id], (err, results) => {
      res.render("edit", { todo: results[0], error: "Task cannot be blank" });
    });
  }

  req.db.query('UPDATE todos SET task = ? WHERE id = ?;', [updatedTask, id], (err, results) => {
    if (err) return res.status(500).send("Error updating task");
    res.redirect("/");
  });
});

module.exports = router;
