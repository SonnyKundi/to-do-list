//Change Header Background when scrolling down

function scrollHeader() {
  const scrollHeader = document.getElementById("header");
  if (window.scrollY >= 200) {
    scrollHeader.classList.add("scroll-header");
  } else {
    scrollHeader.classList.remove("scroll-header");
  }
}

window.addEventListener("scroll", scrollHeader);

window.addEventListener("load", () => {
  todos = JSON.parse(localStorage.getItem("todos")) || [];
  const nameInput = document.querySelector("#name");
  const newTodoForm = document.querySelector("#new-todo-form");

  const username = localStorage.getItem("username") || "";

  nameInput.value = username;

  nameInput.addEventListener("change", (e) => {
    localStorage.setItem("username", e.target.value);
  });

  document.addEventListener("submit", (e) => {
    e.preventDefault();

    const todo = {
      content: e.target.elements.content.value,
      category: e.target.elements.category.value,
      done: false,
      createdAt: new Date().getTime(),
    };

    todos.push(todo);

    localStorage.setItem("todos", JSON.stringify(todos));

    // Reset the form
    e.target.reset();

    DisplayTodos();
  });

  DisplayTodos();

  addDragListeners();

});

function DisplayTodos() {
  const todoList = document.querySelector("#todo-list");
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const todoItem = document.createElement("div");
    todoItem.classList.add("todo-item");
    todoItem.draggable = true;
    // Inside the forEach loop where you create todoItem divs
    todoItem.setAttribute("draggable", "true");
    todoItem.classList.add("draggable-item");
    const label = document.createElement("label");
    const input = document.createElement("input");
    const span = document.createElement("span");
    const content = document.createElement("div");
    const actions = document.createElement("div");
    const edit = document.createElement("button");
    const deleteButton = document.createElement("button");

    input.type = "checkbox";
    input.checked = todo.done;
    span.classList.add("tasks");
    if (todo.category == "personal") {
      span.classList.add("personal");
    } else if (todo.category == "business") {
      span.classList.add("business");
    } else if (todo.category == "educational") {
      span.classList.add("educational");
    } else if (todo.category == "financial") {
      span.classList.add("financial");
    } else if (todo.category == "work") {
      span.classList.add("work");
    } else if (todo.category == "home") {
      span.classList.add("home");
    } else if (todo.category == "health and fitness") {
      span.classList.add("health and fitness");
    } else if (todo.category == "travel") {
      span.classList.add("travel");
    } else {
      span.classList.add("creative");
    }

    content.classList.add("todo-content");
    actions.classList.add("actions");
    edit.classList.add("edit");
    deleteButton.classList.add("delete");

    content.innerHTML = `<input type="text" value="${todo.content}" readonly>`;
    edit.innerHTML = "Edit";
    deleteButton.innerHTML = "Delete";

    label.appendChild(input);
    label.appendChild(span);
    actions.appendChild(edit);
    actions.appendChild(deleteButton);
    todoItem.appendChild(label);
    todoItem.appendChild(content);
    todoItem.appendChild(actions);

    todoList.appendChild(todoItem);

    if (todo.done) {
      todoItem.classList.add("done");
    }

    input.addEventListener("change", (e) => {
      todo.done = e.target.checked;
      localStorage.setItem("todos", JSON.stringify(todos));

      if (todo.done) {
        todoItem.classList.add("done");
      } else {
        todoItem.classList.remove("done");
      }

      DisplayTodos();
    });

    edit.addEventListener("click", (e) => {
      const input = content.querySelector("input");
      input.removeAttribute("readonly");
      input.focus();
      input.addEventListener("blur", (e) => {
        input.setAttribute("readonly", true);
        todo.content = e.target.value;
        localStorage.setItem("todos", JSON.stringify(todos));
        DisplayTodos();
      });
    });

    deleteButton.addEventListener("click", (e) => {
      todos = todos.filter((t) => t !== todo);
      localStorage.setItem("todos", JSON.stringify(todos));
      DisplayTodos();
    });
 
  // Drag and Drop functionality
  todoItem.addEventListener("dragstart", dragStart);
  todoItem.addEventListener("dragover", dragOver);
  todoItem.addEventListener("dragleave", dragLeave);
  todoItem.addEventListener("drop", drop);
  todoItem.addEventListener("dragend", dragEnd);

  todoList.appendChild(todoItem);
  });
  }
  
  addDragListeners();

  function addDragListeners() {
    const draggableElements = document.querySelectorAll(".draggable-item");

    draggableElements.forEach((element) => {
      element.addEventListener("dragstart", dragStart);
      element.addEventListener("dragover", dragOver);
      element.addEventListener("dragleave", dragLeave);
      element.addEventListener("drop", drop);
      element.addEventListener("dragend", dragEnd);
    });
  } 

  // Drag and Drop functionality
  let draggedItem = null;

  function dragStart(event) {
  draggedItem = this;
  this.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/html", this.innerHTML);
  }

  function dragOver(event) {
  event.preventDefault();
  this.classList.add("drag-over");
  event.dataTransfer.dropEffect = "move";
  }

  function dragLeave() {
  this.classList.remove("drag-over");
  }

  function drop(event) {
  if (draggedItem !== this) {
  draggedItem.innerHTML = this.innerHTML;
  this.innerHTML = event.dataTransfer.getData("text/html");
  }
  this.classList.remove("drag-over");
  }

  function dragEnd() {
  this.classList.remove("dragging");
  }

  document.addEventListener("DOMContentLoaded", function () {
  const todoListElements = document.getElementById("todo-list");

  // Get all draggable elements
  const draggableElements = document.getElementsByClassName("draggable-item");
  Array.from(draggableElements).forEach(function (element) {
  element.addEventListener("dragstart", dragStart);
  element.addEventListener("dragover", dragOver);
  element.addEventListener("dragleave", dragLeave);
  element.addEventListener("drop", drop);
  element.addEventListener("dragend", dragEnd);
  });
  });
