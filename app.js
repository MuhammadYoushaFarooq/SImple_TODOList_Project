// Simple Todo List Application - Add and Delete Only
class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];

    this.initializeElements();
    this.bindEvents();
    this.render();
  }

  initializeElements() {
    this.todoInput = document.getElementById("todoInput");
    this.addBtn = document.getElementById("addBtn");
    this.todoList = document.getElementById("todoList");
    this.emptyState = document.getElementById("emptyState");
    this.taskCounter = document.getElementById("taskCounter");
    this.taskCount = document.getElementById("taskCount");
  }

  bindEvents() {
    // Add todo
    this.addBtn.addEventListener("click", () => this.addTodo());
    this.todoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.addTodo();
      }
    });

    // Focus input on page load
    this.todoInput.focus();
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) {
      this.showNotification("Please enter a task!", "error");
      this.todoInput.focus();
      return;
    }

    if (text.length > 200) {
      this.showNotification(
        "Task is too long! Please keep it under 200 characters.",
        "error"
      );
      this.todoInput.focus();
      return;
    }

    const todo = {
      id: Date.now(),
      text: text,
      createdAt: new Date().toISOString(),
    };

    this.todos.unshift(todo);
    this.saveToStorage();
    this.render();
    this.todoInput.value = "";
    this.todoInput.focus();

    this.showNotification("Task added successfully!", "success");
    this.addBtn.classList.add("success");
    setTimeout(() => this.addBtn.classList.remove("success"), 600);
  }

  deleteTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      this.todos = this.todos.filter((t) => t.id !== id);
      this.saveToStorage();
      this.render();
      this.showNotification("Task deleted!", "success");
    }
  }

  editTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector(".todo_text");
    const currentText = todoText.textContent;

    // Create input for editing
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "edit_input";
    input.style.cssText = `
            flex: 1;
            border: 2px solid #3498db;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 1rem;
            font-family: inherit;
            outline: none;
            background: white;
            color: #374151;
        `;

    // Replace text with input
    todoText.style.display = "none";
    todoText.parentNode.insertBefore(input, todoText);
    input.focus();
    input.select();

    // Handle save and cancel
    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== currentText) {
        if (newText.length > 200) {
          this.showNotification(
            "Task is too long! Please keep it under 200 characters.",
            "error"
          );
          input.focus();
          return;
        }
        todo.text = newText;
        this.saveToStorage();
        this.render();
        this.showNotification("Task updated!", "success");
      } else if (!newText) {
        this.deleteTodo(id);
      }
    };

    const cancelEdit = () => {
      todoText.style.display = "block";
      input.remove();
    };

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveEdit();
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    });
  }

  render() {
    // Update task counter
    this.updateTaskCounter();

    // Show/hide empty state
    if (this.todos.length === 0) {
      this.todoList.style.display = "none";
      this.emptyState.classList.add("show");
    } else {
      this.todoList.style.display = "block";
      this.emptyState.classList.remove("show");
    }

    // Render todo items
    this.todoList.innerHTML = this.todos
      .map((todo) => this.createTodoHTML(todo))
      .join("");
  }

  createTodoHTML(todo) {
    return `
            <li class="todo_item" data-id="${todo.id}">
                <span class="todo_text">${this.escapeHtml(todo.text)}</span>
                <div class="todo_actions">
                    <button class="action_btn delete" onclick="todoApp.deleteTodo(${
                      todo.id
                    })" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  saveToStorage() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  updateTaskCounter() {
    const count = this.todos.length;
    this.taskCount.textContent = count;

    // Update counter text based on count
    const counterText = this.taskCounter.querySelector("span").nextSibling;
    if (counterText) {
      counterText.textContent = " Task";
    }
  }

  showNotification(message, type = "info") {
    // Remove existing notification
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 3000);
  }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener("DOMContentLoaded", () => {
  todoApp = new TodoApp();
});

// Add some additional utility functions
window.addEventListener("beforeunload", () => {
  // Save any pending changes
  if (todoApp) {
    todoApp.saveToStorage();
  }
});
