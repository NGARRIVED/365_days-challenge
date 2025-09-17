const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addBtn = document.getElementById("add-btn");

// Function to add a new task
function addTask() {
    if (inputBox.value === '') {
        alert("You must write something!");
    } else {
        let li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);
        
        let span = document.createElement("span");
        span.innerHTML = "\u00d7"; // Adds the 'x' for deleting
        li.appendChild(span);
    }
    inputBox.value = "";
    saveData(); // Save the new list to localStorage
}

// Add task when the "Add" button is clicked
addBtn.addEventListener("click", addTask);

// Add task when "Enter" is pressed
inputBox.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addTask();
    }
});

// Handle click events on the list (for completing or deleting tasks)
listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        saveData();
    } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        saveData();
    }
}, false);

// Function to save data to localStorage
function saveData() {
    localStorage.setItem("todoData", listContainer.innerHTML);
}

// Function to show tasks from localStorage on page load
function showTasks() {
    listContainer.innerHTML = localStorage.getItem("todoData");
}

// Load tasks when the page is opened
showTasks();
