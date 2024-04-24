// TASK: import helper functions from utils
// TASK: import initialData

import { getTasks, createNewTask, patchTask, deleteTask } from './utils/taskFunctions.js';
import { initialData } from './initialData.js';


// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM

// Completed
const elements = {

//ELEMENTS

//Navigation Sidebar
hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
showSideBarBtn: document.getElementById('show-side-bar-btn'),
sideBar: document.querySelector('.side-bar'),
logo: document.getElementById('logo'),
boardsNavLinks: document.getElementById('boards-nav-links-div'),
toggleSwitch: document.getElementById('switch'),

//Task Columns
doneColumn: document.querySelector('[data-status="done"]'),
todoColumn: document.querySelector('[data-status="todo"]'),
doingColumn: document.querySelector('[data-status="doing"]'),

// New Task Modal
selectStatus: document.getElementById('select-status'),
createTaskBtn: document.getElementById('create-task-btn'),
cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
newTaskModalWindow: document.getElementById('new-task-modal-window'),
titleInput: document.getElementById('title-input'),
descInput: document.getElementById('desc-input'),

// Main Layout
addNewTaskBtn: document.getElementById('add-new-task-btn'),
editBoardBtn: document.getElementById('edit-board-btn'),
deleteBoardBtn: document.getElementById('deleteBoardBtn'),
layout: document.getElementById('layout'),
header: document.getElementById('header'),
headerBoardName: document.getElementById('header-board-name'),

// Edit Task Modal
saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
cancelEditBtn: document.getElementById('cancel-edit-btn'),
deleteTaskBtn: document.getElementById('delete-task-btn'),
editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
editTaskTitleInput: document.getElementById('edit-task-title-input'),
editTaskDescInput: document.getElementById('edit-task-desc-input'),
editSelectStatus: document.getElementById('edit-select-status'),

// Filter Div
filterDiv: document.getElementById('filterDiv')
};

let activeBoard = "";



// Extracts unique board names from tasks

//FIXED CODE
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; // Corrected ternary operator
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard); // Ensure styleActiveBoard function is defined and works correctly
    refreshTasksUI(); // Ensure refreshTasksUI function is defined and updates the UI appropriately
  }
}

// Creates different boards in the DOM
//Fixed click event Listener syntax
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Ensure correct assignment of activeBoard
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard)); // Check if correct value is stored
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
 // Use comparison operator ===
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

 const columnDivs = [elements.todoColumn, elements.doingColumn, elements.doneColumn];
  columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                        <span class="dot" id="${status}-dot"></span>
                        <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    //Fixed equality operator
    filteredTasks.filter(task => task.status === status).forEach(task => { // Use comparison operator ===
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      //Fixed click event listener syntax
      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active clas
//Fixed Bug

function styleActiveBoard(boardName) {
  // Corrected forEach method
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if (btn.textContent === boardName) {
      btn.classList.add('active'); // Used classList.add to add class
    } else {
      btn.classList.remove('active'); // Used classList.remove to remove class
    }
  });
}

function addTaskToUI(task) {
  // Used backticks for template literal
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  
// Function to delete a task (unchanged)
function deleteTask(taskId) {
  // Retrieve tasks from local storage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Find the index of the task to delete
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  // If task found, remove it from the tasks array
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);

    // Update local storage with the modified tasks array
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Refresh the UI to reflect the deletion
    refreshTasksUI();
  }
}

// Function to refresh the UI with tasks from local storage (unchanged)
function refreshTasksUI() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Clear existing tasks on the UI
  elements.todoColumn.innerHTML = '';
  elements.doingColumn.innerHTML = '';
  elements.doneColumn.innerHTML = '';

  // Loop through tasks and add them to the appropriate column
  tasks.forEach(task => {
    const column = getColumnElementByStatus(task.status);
    if (column) {
      const taskElement = createTaskElement(task);
      column.appendChild(taskElement);
    }
  });
}

//Code needed for changing status
  // Function to create a task element (unchanged)
function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.classList.add('task-div');
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);
  taskElement.addEventListener('click', () => openEditTaskModal(task));
  return taskElement;
}

// Function to get column element by status (unchanged)
function getColumnElementByStatus(status) {
  switch (status) {
    case 'todo':
      return elements.todoColumn;
    case 'doing':
      return elements.doingColumn;
    case 'done':
      return elements.doneColumn;
    default:
      return null;
  }
}

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; 
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); // Pass taskElement as parameter
}


function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModalWindow));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.toggleSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit', event => {
    addTask(event);
  });

  // Save task changes event listener
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges();
  });

  // Delete task event listener
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  deleteTaskBtn.addEventListener('click', () => {
    deleteTask(taskId); // Add taskId or any identifier for the task to be deleted
    toggleModal(false, elements.editTaskModalWindow);
    refreshTasksUI();
  });
}

// Toggles tasks modal
//FIXED BUGS
function toggleModal(show, modal = elements.newTaskModalWindow) {
  modal.style.display = show ? 'block' : 'none'; // Corrected ternary operator syntax
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 


//Assign user input to the task object
   const task = {
      title: elements.titleInput.value,
      description: elements.descInput.value,
      status: elements.selectStatus.value,
      board: activeBoard
    };

  // createNewTask returns a new task object
  const newTASK = createNewTask(task); // Implemented createNewTask function
  if (newTASK) {
    addTaskToUI(newTASK);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sidebar = document.querySelector('.side-bar');
  if (show) {
   sidebar.style.display = 'block';
   svg.style.display = 'none';
  } else {
    sidebar.style.display = 'none';
    svg.style.display = 'block';
  }
  console.log(sidebar);
}

function toggleTheme() {
  const body = document.body;
  const isLightTheme = body.classList.contains('light-theme');
  body.classList.toggle('light-theme', !isLightTheme);
  body.classList.toggle('dark-theme', isLightTheme);
  localStorage.setItem('theme', isLightTheme ? 'dark' : 'light');
}


function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Add event listener to the delete button
  elements.deleteTaskBtn.addEventListener('click', () => {
  // Delete task using a helper function and close the task modal
   deleteTask(task.id);
    // After deleting the task, close the task modal
    toggleModal(false, elements.editTaskModalWindow);
    refreshTasksUI();
  });

  // Remove any previous event listener before adding a new one
  elements.saveTaskChangesBtn.removeEventListener('click', saveTaskChanges);

// Add event listener to the save changes button
elements.saveTaskChangesBtn.addEventListener('click', () => {
  saveTaskChanges(task); // Pass the task object to the saveTaskChanges function
});

  // Show the edit task modal
  toggleModal(true, elements.editTaskModalWindow);
}

function saveTaskChanges(task) {
  // Get new user inputs
  const updatedTitle = elements.editTaskTitleInput.value;
  const updatedDescription = elements.editTaskDescInput.value;
  const updatedStatus = elements.editSelectStatus.value;

  // Create an object with the updated task details
  const updatedTask = {
    id: task.id, 
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus,
    board: task.board // Retain the board value
  };


// Update the task object with the new values
task.title = updatedTitle;
task.description = updatedDescription;
task.status = updatedStatus;

// Retrieve tasks from local storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Find the index of the task to update
const taskIndex = tasks.findIndex(t => t.id === task.id);

// If task found, update it in the tasks array
if (taskIndex !== -1) {
  tasks[taskIndex] = task;

  // Update local storage with the modified tasks array
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Update task using a helper function
  patchTask(task); 

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModalWindow);
  refreshTasksUI();
}
}
/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData(); // Call initializeData() function to ensure local storage is initialized
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}

//BUTTON

// Create an SVG element
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("width", "19");
svg.setAttribute("height", "19");

// Create a text element inside the SVG for the eye emoji
const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
text.setAttribute("x", "2");
text.setAttribute("y", "15");
text.setAttribute("font-size", "14");
text.setAttribute("fill", "#828FA3");
text.textContent = "👀";

// Append the text element to the SVG
svg.appendChild(text);

// Get the layout container
const layout = document.getElementById("layout");

// Append the SVG to the layout container
layout.appendChild(svg);

// Add an event listener to the SVG to toggle the sidebar when clicked
svg.addEventListener("click", function() {
  toggleSidebar(true); // Open the sidebar when clicked
  svg.style.display = "none";
});

// Selecting the "done" column
const doneColumn = document.querySelector('.column-div[data-status="done"]');

// Function to add a task to the "done" column
function addTaskToDoneColumn(task) {
  if (!doneColumn) {
    console.error('Column not found for status: done');
    return;
  }

  const taskElement = document.createElement('div');
  taskElement.classList.add('task-div');
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  doneColumn.appendChild(taskElement);
}
// Call the function to add the task to the "done" column
addTaskToDoneColumn(task);