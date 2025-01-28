import ProjectList from "./ProjectList";

export default class Display {
  #projectList;
  #sidebarList = document.querySelector("#project-list");
  #todayElement = document.querySelector("#today");
  #todayTasks = document.querySelector("#today-tasks");
  #projectAddDialog = document.querySelector("#project-add-dialog");
  #taskAddDialog = document.querySelector("#task-add-dialog");
  /** Array of objects { id, name, projectElement } */
  #projectElements = [];
  /** Array of objects { id, projectId, taskElement } */
  #taskElements = [];

  constructor() {
    // add sidebar button event listeners
    document.querySelector("#add-task-btn").addEventListener("click", this.#handleTaskAddClick.bind(this));
    document.querySelector("#today-add-task-btn").addEventListener("click", this.#handleTaskAddClick.bind(this));
    document.querySelector("#add-project-btn").addEventListener("click", this.#handleProjectAddClick.bind(this));
    document.querySelector("#inbox-btn").addEventListener("click", this.#handleProjectClick.bind(this));
    document.querySelector("#today-btn").addEventListener("click", this.#handleProjectClick.bind(this));

    // add dialog event listeners
    document.querySelector("#task-add-submit").addEventListener("click", this.#handleTaskAddSubmit.bind(this));
    document.querySelector("#task-add-close").addEventListener("click", this.#handleTaskAddClose.bind(this));
    document.querySelector("#project-add-submit").addEventListener("click", this.#handleProjectAddSubmit.bind(this));
    document.querySelector("#project-add-close").addEventListener("click", this.#handleProjectAddClose.bind(this));

    // get data from storage, if any
    let data = this.#getData();

    // create project list
    this.#projectList = new ProjectList(data);

    // create project elements and add to array
    data.projects.forEach(project => {
      this.#createProjectElement(project);
      if (project.id != 0) {
        this.#addSidebarButton(project);
        this.#addProjectSelectOption(project);
      }

      project.tasks.forEach(task => {
        this.#createTaskElement(task);
      });
    });

    // create task elements and add each to its project element

    // populate sidebar with project buttons

    // load today's tasks and render them
    this.#renderProject(null);
  }

  // ------------------------------ event handlers ------------------------------

  /**
   * Event handler for clicking an add task button
   * @param {Event} event 
   */
  #handleTaskAddClick(event) {
    // clear form
    document.querySelector("#task-add-form").reset();

    // where button was clicked, null for today
    let src = event.target.dataset.proj ?? null;

    // prefill project name in dialog, default to 0 for inbox
    document.querySelector("#task-add-project").value = src ?? 0;
    document.querySelector("#task-add-src").value = src;

    this.#taskAddDialog.showModal();
  }

  /**
   * Event handler for clicking the submit button on the task add dialog.
   * Adds a task to the projectList and creates a task element
   * @param {Event} event 
   */
  #handleTaskAddSubmit(event) {
    event.preventDefault();
    let name = document.querySelector("#task-add-name").value;
    let projectId = document.querySelector("#task-add-project").value;
    let description = document.querySelector("#task-add-desc").value;
    let dateString = document.querySelector("#task-add-date").value;
    let dateParts = dateString.split("-");
    let dueDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
    dueDate = new Date(dueDate.getTime() + dueDate.getTimezoneOffset() * 60000);
    let src = document.querySelector("#task-add-src").value;

    // add task to projectList
    let id = this.#projectList.addTask(projectId, { name, description, dueDate });
    // this.#saveData();

    // create task element
    this.#createTaskElement({ id, projectId, name, description, dueDate });
    
    this.#taskAddDialog.close();

    // if task was added from today and is due today, render today
    // else render project
    if (!src && dueDate && dueDate <= new Date(Date.now()).setHours(23, 59, 59, 999)) {
      this.#renderProject(null);
    }
    else {
      this.#renderProject(projectId);
    }
  }

  /**
   * Event handler for clicking the close button on the task add dialog
   * @param {Event} event 
   */
  #handleTaskAddClose(event) {
    this.#taskAddDialog.close();
  }

  /**
   * Event handler for clicking the add project button
   * @param {Event} event 
   */
  #handleProjectAddClick(event) {
    // clear form
    document.querySelector("#project-add-form").reset();

    this.#projectAddDialog.showModal();
  }

  /**
   * Event handler for clicking the submit button on the project add dialog
   * @param {Event} event 
   */
  #handleProjectAddSubmit(event) {
    event.preventDefault();
    let name = document.querySelector("#project-add-name").value;
    
    let id = this.#projectList.addProject({ name });
    // this.#saveData();

    this.#createProjectElement({ id, name });
    this.#addSidebarButton({ id, name });
    this.#addProjectSelectOption({ id, name });

    this.#projectAddDialog.close();
  }

  /**
   * Event handler for clicking on the close button of the project add dialog
   * @param {Event} event 
   */
  #handleProjectAddClose(event) {
    this.#projectAddDialog.close();
  }

  /**
   * Event handler for clicking on a project button in the sidebar
   * @param {Event} event 
   */
  #handleProjectClick(event) {
    // get project id
    let id = event.target.dataset.proj;
    // render project element
    this.#renderProject(id);
  }

  /**
   * Event handler for clicking the checkbox of a task
   * @param {Event} event 
   */
  #handleTaskCheckClick(event) {
    // get task id
    let id = event.target.parentElement.dataset.task;
    let project = event.target.parentElement.dataset.proj;
    // toggle task completion
    this.#toggleTaskElement(id);
    // update task in projectList
    this.#projectList.toggleTask(project, id);
  }

  // task edit buttons
  #handleTaskEditClick(event) {
    // get task id
    // get task data
    // create popup
    // populate form with task data
    // get updated task data from form
    // update task element
    // if project is changed, remove task from old project and add to new project
    // update task in projectList
  }

  #handleTaskEditSubmit(event) {}

  #handleTaskEditClose(event) {}
  // project name
  // task body

  // ------------------------------ element creation ------------------------------

  /**
   * Creates a project element, adds it to the project elements array, and returns it
   * @param {Object} projectJson JSON object containing project data
   * @param {Number} projectJson.id id of the project
   * @param {String} projectJson.name name of the project
   * @param {Array<Object>=} projectJson.tasks array of taskJson objects, default: []
   * @returns {HTMLElement} project element
   */
  #createProjectElement({ id, name, tasks = [] }) {
    let projectElement = document.createElement("div");
    let projectName = document.createElement("h1");
    let taskDiv = document.createElement("div");
    let button = document.createElement("button");

    projectElement.classList.add("project");
    projectElement.id = `p${id}`;

    projectName.classList.add("project-name");
    projectName.id = `p${id}-name`;
    projectName.textContent = name;
    projectElement.appendChild(projectName);

    taskDiv.classList.add("tasks");
    taskDiv.id = `p${id}-tasks`;
    tasks.forEach(task => {
      let taskElement = this.#createTaskElement(task);
      taskDiv.appendChild(taskElement);
    });
    projectElement.appendChild(taskDiv);

    button.classList.add("p-add-task-btn");
    button.textContent = "Add task";
    button.id = `p${id}-add-task-btn`;
    button.dataset.proj = id;
    button.addEventListener("click", this.#handleTaskAddClick.bind(this));
    projectElement.appendChild(button);

    this.#projectElements.push({ id, name, projectElement });

    return projectElement;
  }

  /**
   * Creates a task element and returns it
   * @param {Object} taskJson JSON object containing task data
   * @param {Number} taskJson.id id of the task
   * @param {Number} taskJson.projectId id of parent project
   * @param {String} taskJson.name name of the task
   * @param {String=} taskJson.description short description of the task, default: null
   * @param {Date=} taskJson.dueDate date task is due, default: null
   * @param {Boolean=} taskJson.completed status of task, default: false
   * @returns {HTMLElement} task element
   */
  #createTaskElement({ id, projectId, name, description = null, dueDate = null, completed = false }) {
    let taskElement = document.createElement("div");
    let checkbox = document.createElement("button");
    let taskText = document.createElement("div");
    let taskName = document.createElement("p");
    let taskDescription; // optional
    let taskDueDate; // optional
    let taskEdit = document.createElement("button");

    taskElement.classList.add("grid");
    taskElement.classList.add("task");
    taskElement.id = `t${id}`;
    taskElement.dataset.task = id;
    taskElement.dataset.proj = projectId

    checkbox.classList.add("checkbox");
    checkbox.id = `t${id}-check`;
    checkbox.textContent = '✓';
    checkbox.addEventListener("click", this.#handleTaskCheckClick.bind(this));
    taskElement.appendChild(checkbox);

    taskText.classList.add("task-text");
    taskText.id = `t${id}-text`;
    taskElement.appendChild(taskText);

    taskName.classList.add("task-name");
    taskName.id = `t${id}-name`;
    taskName.textContent = name;
    taskText.appendChild(taskName);

    if (description) {
      taskDescription = document.createElement("p");
      taskDescription.classList.add("task-desc");
      taskDescription.id = `t${id}-desc`;
      taskDescription.textContent = description;
      taskText.appendChild(taskDescription);
    }

    if (dueDate && dueDate != "Invalid Date") {
      taskDueDate = document.createElement("p");
      taskDueDate.classList.add("task-date");
      taskDueDate.id = `t${id}-date`;
      taskDueDate.textContent = dueDate.toDateString();
      taskElement.appendChild(taskDueDate);
    }

    taskEdit.classList.add("task-edit");
    taskEdit.id = `t${id}-edit`;
    taskEdit.textContent = "Edit";
    taskEdit.addEventListener("click", this.#handleTaskEditClick.bind(this));
    taskElement.appendChild(taskEdit);

    this.#taskElements.push({ id, projectId, taskElement });

    this.#projectElements.find(project => project.id == projectId).projectElement.querySelector(".tasks").appendChild(taskElement);

    return taskElement;
  }

  /**
   * Adds a project button to the sidebar
   * @param {Object} projectJson JSON object containing project data
   * @param {Number} projectJson.id id of the project
   * @param {String} projectJson.name name of the project
   */
  #addSidebarButton({ id, name }) {
    let button = document.createElement("button");
    button.classList.add("nav-btn");
    button.id = `p${id}-btn`;
    button.dataset.proj = id;
    button.textContent = name;
    button.addEventListener("click", this.#handleProjectClick);
    this.#sidebarList.appendChild(button);
  }

  /**
   * Adds an option for the project select field of the add task form
   * @param {Object} projectJson JSON object containing project data
   * @param {Number} projectJson.id id of the project
   * @param {String} projectJson.name name of the project 
   */
  #addProjectSelectOption({ id, name }) {
    let option = document.createElement("option");
    option.id = `task-add-p${id}`;
    option.value = id;
    option.dataset.proj = id;
    option.textContent = name;
    document.querySelector("#task-add-project").appendChild(option);

    option.id = `task-edit-p${id}`;
    document.querySelector("#task-edit-project").appendChild(option);
  }

  // ------------------------------ element selection ------------------------------

  /**
   * Finds the project element with the given id
   * @param {Number} projectId id of the project
   * @returns {Object} the project element object
   */
  #getProjectElementObject(projectId) {
    return this.#projectElements.find(project => project.id == projectId);
  }

  /**
   * Finds the task element object with the given id
   * @param {Number} taskId id of the task
   * @returns {Object} the task element object
   */
  #getTaskElementObject(taskId) {
    return this.#taskElements.find(task => task.id == taskId);
  }

  // ------------------------------ element manipulation ------------------------------

  #editProjectElementName(projectId, newName) {
    let project = this.#getProjectElementObject(projectId).projectElement;
    project.querySelector(".project-name").textContent = newName;
  }

  #editTaskElement(taskId, { name, description, dueDate }) {
    let task = this.#getTaskElementObject(taskId).taskElement;
    if (name) {
      task.querySelector(".task-name").textContent = name;
    }
    if (description) {
      task.querySelector(".task-desc").textContent = description;
    }
    if (dueDate) {
      task.querySelector(".task-date").textContent = dueDate.toDateString();
    }
  }

  #toggleTaskElement(taskId) {
    let task = this.#getTaskElementObject(taskId).taskElement;
    task.classList.toggle("complete");
  }

  #moveTaskElement(taskId, newProjectId) {
    let task = this.#getTaskElementObject(taskId);
    let projectElement = this.#getProjectElementObject(newProjectId);
    let oldProjectElement = this.#getProjectElementObject(task.projectId);

    task.projectId = newProjectId;
    projectElement.projectElement.querySelector(".tasks").appendChild(task.taskElement);
    oldProjectElement.projectElement.querySelector(".tasks").removeChild(task.taskElement);
  }

  // ------------------------------ element removal ------------------------------

  #removeProjectElement(projectId) {}

  #removeTaskElement(taskId) {}

  // ------------------------------ rendering ------------------------------

  /**
   * Replace the current project element with the project element with the given id
   * @param {Number=} projectId id of the project to render, null for today
   */
  #renderProject(projectId=null) {
    let projectElement;
    if (projectId) {
      projectElement = this.#getProjectElementObject(projectId).projectElement;
      
      this.#taskElements.forEach(task => {
        if (task.projectId == projectId) {
          projectElement.querySelector(".tasks").appendChild(task.taskElement);
        }
      });
    }
    else {
      // today at midnight local time
      let today = new Date(Date.now()).setHours(23, 59, 59, 999);

      // clear task elements from today element
      this.#todayTasks.replaceChildren();

      this.#taskElements.forEach(task => {
        let dueDate = this.#projectList.getTaskData(task.projectId, task.id).dueDate;
        if (dueDate <= today) {
          this.#todayTasks.appendChild(task.taskElement);
        }
      })

      projectElement = this.#todayElement;
    }
    document.querySelector("main").replaceChildren(projectElement);
  }

  // ------------------------------ storage ------------------------------
  
  // get data from storage
  #getData() {
    let data = localStorage.getItem("projectList");
    if (data) {
      return JSON.parse(data);
    }
    else {
      return {
        projects: [
          { id: 0, name: "Inbox", tasks: [] }
        ]
      };
    }
  }

  #saveData() {
    localStorage.setItem("projectList", JSON.stringify(this.#projectList.toJson()));
  }
}