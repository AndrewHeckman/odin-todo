import ProjectList from "./ProjectList";

export default class Display {
  #projectList;
  #sidebarList;
  #todayElement;
  #todayTasks;
  #taskAddDialog;
  #projectAddDialog;
  #taskEditDialog;
  #projectEditDialog;
  #taskDeleteDialog;
  #projectDeleteDialog;
  /** Array of objects { id, name, projectElement } */
  #projectElements = [];
  /** Array of objects { id, projectId, taskElement } */
  #taskElements = [];

  constructor() {
    this.#sidebarList = document.querySelector("#project-list");
    this.#todayElement = document.querySelector("#today");
    this.#todayTasks = document.querySelector("#today-tasks");
    this.#taskAddDialog = document.querySelector("#task-add-dialog");
    this.#projectAddDialog = document.querySelector("#project-add-dialog");
    this.#taskEditDialog = document.querySelector("#task-edit-dialog");
    this.#projectEditDialog = document.querySelector("#project-edit-dialog");
    this.#taskDeleteDialog = document.querySelector("#task-delete-dialog");
    this.#projectDeleteDialog = document.querySelector("#project-delete-dialog");

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
    document.querySelector("#task-edit-submit").addEventListener("click", this.#handleTaskEditSubmit.bind(this));
    document.querySelector("#task-edit-close").addEventListener("click", this.#handleTaskEditClose.bind(this));
    document.querySelector("#project-edit-submit").addEventListener("click", this.#handleProjectEditSubmit.bind(this));
    document.querySelector("#project-edit-close").addEventListener("click", this.#handleProjectEditClose.bind(this));
    document.querySelector("#task-delete-submit").addEventListener("click", this.#handleTaskDeleteSubmit.bind(this));
    document.querySelector("#task-delete-close").addEventListener("click", this.#handleTaskDeleteClose.bind(this));
    document.querySelector("#project-delete-submit").addEventListener("click", this.#handleProjectDeleteFull.bind(this));
    document.querySelector("#project-delete-move").addEventListener("click", this.#handleProjectDeleteMove.bind(this));
    document.querySelector("#project-delete-close").addEventListener("click", this.#handleProjectDeleteClose.bind(this));

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
    });

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
    let dueDate = null;
    let priority = parseInt(document.querySelector("#task-add-priority").value);
    let src = document.querySelector("#task-add-src").value;
    
    if (dateString && dateString != "Invalid Date") {
      dateString = `${dateString}T00:00:00`;
      dueDate = new Date(dateString);
    }

    // add task to projectList
    let id = this.#projectList.addTask(projectId, { name, description, dueDate, priority });
    
    this.#saveData();

    // create task element
    this.#createTaskElement({ id, projectId, name, description, dueDate, priority });
    
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
    event.preventDefault();
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
    
    this.#saveData();

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
    event.preventDefault();
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
    
    this.#saveData();
  }

  // task edit buttons
  #handleTaskEditClick(event) {
    document.querySelector("#task-edit-form").reset();

    // get task id
    let id = event.target.parentElement.dataset.task;
    let project = event.target.parentElement.dataset.proj;
    // get task data
    let taskData = this.#projectList.getTaskData(project, id);
    let dueDate = taskData.dueDate;
    // populate form with task data
    document.querySelector("#task-edit-name").value = taskData.name;
    document.querySelector("#task-edit-project").value = project;
    document.querySelector("#task-edit-desc").value = taskData.description;
    document.querySelector("#task-edit-priority").value = taskData.priority;
    document.querySelector("#task-edit-src").value = id;
    if (dueDate) {
      let year = dueDate.getFullYear();
      let month = dueDate.getMonth() + 1;
      let day = dueDate.getDate();

      if (month < 10) {
        month = `0${month}`;
      }

      if (day < 10) {
        day = `0${day}`;
      }

      document.querySelector("#task-edit-date").value = `${year}-${month}-${day}`;
    }

    // show dialog
    this.#taskEditDialog.showModal();
  }

  #handleTaskEditSubmit(event) {
    event.preventDefault();
    // get updated task data from form
    let id = document.querySelector("#task-edit-src").value;
    let name = document.querySelector("#task-edit-name").value;
    let projectId = document.querySelector("#task-edit-project").value;
    let description = document.querySelector("#task-edit-desc").value;
    let dateString = document.querySelector("#task-edit-date").value;
    let dueDate = null;
    let priority = parseInt(document.querySelector("#task-edit-priority").value);
    
    if (dateString && dateString != "Invalid Date") {
      dateString = `${dateString}T00:00:00`;
      dueDate = new Date(dateString);
    }

    // update task element
    this.#editTaskElement(id, { name, description, dueDate, priority });
    
    // if project is changed, move task
    let oldProjectId = this.#getTaskElementObject(id).projectId;
    if (oldProjectId != projectId) {
      this.#moveTaskElement(id, projectId);
      this.#projectList.moveTask(oldProjectId, id, projectId);
      this.#renderProject(projectId);
    }

    // update task in projectList
    this.#projectList.editTask(projectId, id, { name, description, dueDate, priority });
    
    this.#saveData();

    this.#taskEditDialog.close();
  }

  #handleTaskEditClose(event) {
    event.preventDefault();
    this.#taskEditDialog.close();
  }

  // click on project name to edit
  #handleProjectEditClick(event) {
    document.querySelector("#project-edit-form").reset();

    let id = event.target.parentElement.dataset.proj;
    let name = this.#projectList.getProjectData(id).name;

    document.querySelector("#project-edit-name").value = name;
    document.querySelector("#project-edit-src").value = id;

    this.#projectEditDialog.showModal();
  }

  #handleProjectEditSubmit(event) {
    event.preventDefault();
    let id = document.querySelector("#project-edit-src").value;
    let name = document.querySelector("#project-edit-name").value;

    this.#editProjectElementName(id, name);
    this.#projectList.editProjectName(id, name);

    this.#saveData();

    this.#projectEditDialog.close();
  }

  #handleProjectEditClose(event) {
    event.preventDefault();
    this.#projectEditDialog.close();
  }

  #handleTaskDeleteClick(event) {
    let id = event.target.parentElement.dataset.task;
    document.querySelector("#task-delete-src").value = id;
    this.#taskDeleteDialog.showModal();
  }

  #handleTaskDeleteSubmit(event) {
    event.preventDefault();
    
    let id = document.querySelector("#task-delete-src").value;
    let task = this.#getTaskElementObject(id);
    let projectId = task.projectId;

    task.taskElement.remove();
    this.#taskElements = this.#taskElements.filter(task => task.id != id);
    
    this.#projectList.deleteTask(projectId, id);

    this.#saveData();

    this.#taskDeleteDialog.close();
  }

  #handleTaskDeleteClose(event) {
    event.preventDefault();
    this.#taskDeleteDialog.close();
  }

  
  #handleProjectDeleteClick(event) {
    let id = event.target.parentElement.dataset.proj;
    document.querySelector("#project-delete-src").value = id;
    this.#projectDeleteDialog.showModal();
  }

  // delete project and move tasks to inbox
  #handleProjectDeleteMove(event) {
    event.preventDefault();

    let id = document.querySelector("#project-delete-src").value;
    let project = this.#getProjectElementObject(id);
    let tasks = this.#taskElements.filter(task => task.projectId == id);

    tasks.forEach(task => {
      this.#moveTaskElement(task.id, 0);
      this.#projectList.moveTask(id, task.id, 0);
    });

    // remove project from projectList
    this.#projectList.deleteProject(id);
    // remove project from sidebar
    document.querySelector(`#p${id}-btn`).remove();
    // remove project from project select
    document.querySelector(`#task-add-p${id}`).remove();
    document.querySelector(`#task-edit-p${id}`).remove();
    // remove project from project elements array
    this.#projectElements = this.#projectElements.filter(project => project.id != id);
    
    // close dialog
    this.#projectDeleteDialog.close();
    // render inbox
    this.#renderProject(0);

    this.#saveData();

    // remove project element
    project.projectElement.remove();
  }

  // delete project and tasks
  #handleProjectDeleteFull(event) {
    event.preventDefault();

    let id = document.querySelector("#project-delete-src").value;
    let project = this.#getProjectElementObject(id);

    this.#taskElements = this.#taskElements.filter(task => task.projectId != id);
    // remove project from projectList
    this.#projectList.deleteProject(id);
    // remove project from sidebar
    document.querySelector(`#p${id}-btn`).remove();
    // remove project from project select
    document.querySelector(`#task-add-p${id}`).remove();
    document.querySelector(`#task-edit-p${id}`).remove();
    // remove project from project elements array
    this.#projectElements = this.#projectElements.filter(project => project.id != id);

    // close dialog
    this.#projectDeleteDialog.close();
    // render inbox
    this.#renderProject(null);

    this.#saveData();

    // remove project element
    project.projectElement.remove();
  }

  #handleProjectDeleteClose(event) {
    event.preventDefault();
    this.#projectDeleteDialog.close();
  }

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
    let deleteButton = document.createElement("button");

    this.#projectElements.push({ id, name, projectElement });

    projectElement.classList.add("project");
    projectElement.id = `p${id}`;
    projectElement.dataset.proj = id;

    projectName.classList.add("project-name");
    projectName.id = `p${id}-name`;
    projectName.textContent = name;
    if (id != 0) projectName.addEventListener("click", this.#handleProjectEditClick.bind(this));
    projectElement.appendChild(projectName);

    taskDiv.classList.add("tasks");
    taskDiv.id = `p${id}-tasks`;
    projectElement.appendChild(taskDiv);
    tasks.forEach(task => {
      this.#createTaskElement(task);
    });

    button.classList.add("p-add-task-btn");
    button.textContent = "Add task";
    button.id = `p${id}-add-task-btn`;
    button.dataset.proj = id;
    button.addEventListener("click", this.#handleTaskAddClick.bind(this));
    projectElement.appendChild(button);

    if (id != 0) {
      deleteButton.classList.add("p-delete-btn");
      deleteButton.textContent = "Delete project";
      deleteButton.id = `p${id}-delete-btn`;
      deleteButton.dataset.proj = id;
      deleteButton.addEventListener("click", this.#handleProjectDeleteClick.bind(this));
      projectElement.appendChild(deleteButton);
    }

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
  #createTaskElement({ id, projectId, name, description = null, dueDate = null, completed = false, priority = 0 }) {
    let taskElement = document.createElement("div");
    let checkbox = document.createElement("button");
    let taskText = document.createElement("div");
    let taskName = document.createElement("p");
    let taskDescription; // optional
    let taskDueDate; // optional
    let taskDelete = document.createElement("button");

    this.#taskElements.push({ id, projectId, taskElement });
    this.#projectElements.find(project => project.id == projectId).projectElement.querySelector(".tasks").appendChild(taskElement);

    taskElement.classList.add("grid");
    taskElement.classList.add("task");
    taskElement.id = `t${id}`;
    taskElement.dataset.task = id;
    taskElement.dataset.proj = projectId

    if (completed) taskElement.classList.add("complete");

    checkbox.classList.add("checkbox");
    checkbox.id = `t${id}-check`;
    checkbox.textContent = '✓';
    checkbox.addEventListener("click", this.#handleTaskCheckClick.bind(this));
    taskElement.appendChild(checkbox);

    taskText.classList.add("task-text");
    taskText.id = `t${id}-text`;
    taskText.dataset.task = id;
    taskText.dataset.proj = projectId;
    taskText.addEventListener("click", this.#handleTaskEditClick.bind(this));
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
      if (!(dueDate instanceof Date)) dueDate = new Date(dueDate);

      taskDueDate = document.createElement("p");
      taskDueDate.classList.add("task-date");
      taskDueDate.id = `t${id}-date`;
      taskDueDate.textContent = dueDate.toDateString();
      taskElement.appendChild(taskDueDate);
    }

    switch (priority) {
      case 0:
        taskElement.classList.add("low");
        break;
      case 1:
        taskElement.classList.add("medium");
        break;
      case 2:
        taskElement.classList.add("high");
        break;
    }

    taskDelete.classList.add("task-delete");
    taskDelete.id = `t${id}-delete`;
    taskDelete.textContent = "Delete";
    taskDelete.addEventListener("click", this.#handleTaskDeleteClick.bind(this));
    taskElement.appendChild(taskDelete);

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
    button.addEventListener("click", this.#handleProjectClick.bind(this));
    this.#sidebarList.appendChild(button);
  }

  /**
   * Adds an option for the project select field of the add task form
   * @param {Object} projectJson JSON object containing project data
   * @param {Number} projectJson.id id of the project
   * @param {String} projectJson.name name of the project 
   */
  #addProjectSelectOption({ id, name }) {
    let optionAdd = document.createElement("option");
    let optionEdit = document.createElement("option");
    optionAdd.id = `task-add-p${id}`;
    optionEdit.id = `task-edit-p${id}`;
    optionAdd.value = id;
    optionEdit.value = id;
    optionAdd.dataset.proj = id;
    optionEdit.dataset.proj = id;
    optionAdd.textContent = name;
    optionEdit.textContent = name;
    document.querySelector("#task-add-project").appendChild(optionAdd);
    document.querySelector("#task-edit-project").appendChild(optionEdit);
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
    document.querySelector(`#p${projectId}-btn`).textContent = newName;
    document.querySelector(`#task-add-p${projectId}`).textContent = newName;
    document.querySelector(`#task-edit-p${projectId}`).textContent = newName;
  }

  #editTaskElement(taskId, { name, description, dueDate, priority }) {
    let task = this.#getTaskElementObject(taskId).taskElement;
    let descElement = task.querySelector(".task-desc");
    let dueDateElement = task.querySelector(".task-date");
    task.querySelector(".task-name").textContent = name;
    
    if (description) {
      if (descElement) descElement.textContent = description;
      else {
        descElement = document.createElement("p");
        descElement.classList.add("task-desc");
        descElement.id = `t${taskId}-desc`;
        descElement.textContent = description;
        task.querySelector(".task-text").appendChild(descElement);
      }
    }
    else if (descElement) { 
      descElement.remove();
    }

    if (dueDate) {
      if (!(dueDate instanceof Date)) dueDate = new Date(dueDate);
      if (dueDateElement) dueDateElement.textContent = dueDate.toDateString();
      else {
        dueDateElement = document.createElement("p");
        dueDateElement.classList.add("task-date");
        dueDateElement.id = `t${taskId}-date`;
        dueDateElement.textContent = dueDate.toDateString();

        // add due date before delete button
        task.insertBefore(dueDateElement, task.querySelector(".task-delete"));
      }
    }
    else if (dueDateElement) {
      dueDateElement.remove();
    }

    switch (priority) {
      case 0:
        task.classList.remove("medium");
        task.classList.remove("high");
        task.classList.add("low");
        break;
      case 1:
        task.classList.remove("low");
        task.classList.remove("high");
        task.classList.add("medium");
        break;
      case 2:
        task.classList.remove("low");
        task.classList.remove("medium");
        task.classList.add("high");
        break;
    }
  }

  #toggleTaskElement(taskId) {
    let task = this.#getTaskElementObject(taskId).taskElement;
    task.classList.toggle("complete");
  }

  #moveTaskElement(taskId, newProjectId) {
    let task = this.#getTaskElementObject(taskId);
    let project = this.#getProjectElementObject(newProjectId);

    task.projectId = newProjectId;
    task.taskElement.dataset.proj = newProjectId;
    task.taskElement.querySelector(".task-text").dataset.proj = newProjectId;
    project.projectElement.querySelector(".tasks").appendChild(task.taskElement);
  }

  // ------------------------------ rendering ------------------------------

  /**
   * Replace the current project element with the project element with the given id
   * @param {Number=} projectId id of the project to render, null for today
   */
  #renderProject(projectId=null) {
    let projectElement;
    if (projectId != null) {
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
        if (dueDate && dueDate <= today) {
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
    console.log(this.#projectList.toJson());
    localStorage.setItem("projectList", JSON.stringify(this.#projectList.toJson()));
  }
}