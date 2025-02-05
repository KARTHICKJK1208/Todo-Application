import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todo, setTodo] = useState('');
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTodos();
  }, []);

  function fetchTodos() {
    fetch('http://localhost:5000/todos')
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error('Error fetching todos:', err));
  }

  function addTodo() {
    if (!todo.trim()) return;
    fetch('http://localhost:5000/todo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: todo }),
    })
      .then(() => {
        setTodo('');
        fetchTodos();
      })
      .catch((error) => console.error('Error:', error));
  }

  function toggleTodoCompletion(id, completed) {
    fetch(`http://localhost:5000/todo/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !completed }),
    })
      .then(() => fetchTodos())
      .catch((err) => console.error('Error toggling completion:', err));
  }

  function deleteTodo(id) {
    fetch(`http://localhost:5000/todo/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetchTodos())
      .catch((err) => console.error('Error deleting todo:', err));
  }

  function deleteCompletedTodos() {
    fetch('http://localhost:5000/todos/completed', {
      method: 'DELETE',
    })
      .then(() => fetchTodos())
      .catch((err) => console.error('Error deleting completed todos:', err));
  }

  function deleteAllTodos() {
    fetch('http://localhost:5000/todos/all', {
      method: 'DELETE',
    })
      .then(() => fetchTodos())
      .catch((err) => console.error('Error deleting all todos:', err));
  }

  function startEditing(todo) {
    setEditingTodo(todo.id);  // Changed from _id to id
    setEditText(todo.text);
  }

  function saveEdit() {
    if (!editText.trim()) return;
    fetch(`http://localhost:5000/todo/${editingTodo}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: editText }),
    })
      .then(() => {
        setEditingTodo(null);
        fetchTodos();
      })
      .catch((err) => console.error('Error saving edit:', err));
  }

  function filteredTodos() {
    if (filter === 'All') {
      return todos;
    } else if (filter === 'Done') {
      return todos.filter((todo) => todo.completed);
    } else {
      return todos.filter((todo) => !todo.completed);
    }
  }

  return (
    <div>
      <div className="container">
        <h3 align="center">ToDo List</h3>
        <div className="input-area">
          <input
            id="text-box"
            type="text"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            placeholder="Add new todo"
          />
          <button id="add-button" onClick={addTodo}>
            Add
          </button>
        </div>
      </div>

      <div className="container">
        <div className="filter-buttons">
          <button id="allbtn" onClick={() => setFilter('All')}> ShowAll</button>
          <button id="todobtn" onClick={() => setFilter('Todo')}>Todo</button>
          <button id="donebtn" onClick={() => setFilter('Done')}>Done</button>
        </div>

        <ul>
          {filteredTodos().map((todo) => (
            <li key={todo.id}>  {/* Changed from _id to id */}
              {editingTodo === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button id="save" onClick={saveEdit}>Save</button>
                </>
              ) : (
                <>
                  <span className={todo.completed ? 'completed-text' : ''}>
                    {todo.text}
                  </span>
                  <div>
                    <button id="com" onClick={() => toggleTodoCompletion(todo.id, todo.completed)}>
                      {todo.completed ? 'Uncomplete' : 'Complete'}
                    </button>
                    <button id="edit" onClick={() => startEditing(todo)}>Edit</button>
                    <button id="del" onClick={() => deleteTodo(todo.id)}>X</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="delete-buttons">
          <button onClick={deleteCompletedTodos}>Delete Completed Tasks</button>
          <button onClick={deleteAllTodos}>Delete All Tasks</button>
        </div>
      </div>
    </div>
  );
}

export default App;
