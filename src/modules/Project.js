import Task from "./Task";

export default class Project {
  #id;
  #name;
  #tasks = [];
  static #usedIds = [];
  static #nextId = 0;

  /**
   * Create a new project
   * @param {Object} projectJson object containing project data
   * @param {Number=} projectJson.projectId id of project, default: null
   * @param {String} projectJson.name name of the project
   * @param {Array<Object>=} projectJson.tasks array of task objects, default: []
   */
  constructor({ projectId=null, name, tasks = [] }) {
    if (projectId != null) {
      this.#id = projectId;
      Project.#usedIds.push(projectId);
    }
    else this.#id = Project.#genID();
    this.#name = name;
    tasks.forEach(task => this.addTask(task));
  }

  /**
   * Add a new task to the project
   * @param {Object} taskJson JSON object containing task data
   * @param {Number=} taskJson.id id of task, default: null
   * @param {String} taskJson.name name of task
   * @param {String=} taskJson.description short description of task, default: null
   * @param {Date=} taskJson.creationDate date task was created, default: Date.now()
   * @param {Date=} taskJson.dueDate date task is due, default: null
   * @param {Boolean=} taskJson.completed status of task, default: false
   * @returns {Number} the id of the new task
   */
  addTask(taskJson) {
    if (!taskJson.name) return undefined;
    taskJson.projectId = this.#id;
    let task = new Task(taskJson);
    this.#tasks.push(task);
    return task.id;
  }

  /**
   * Toggle the completed status of a task
   * @param {Number} taskId id of task to toggle
   * @returns {Boolean} true if task was found and toggled, false otherwise
   */
  toggleTask(taskId) {
    let task = this.#findTask(taskId);
    if (!task) return false;
    task.toggleCompleted()
    return true;
  }

  /**
   * Delete a task from the project
   * @param {Number} taskId id of task to delete
   * @returns {Boolean} true if task was found and deleted, false otherwise
   */
  deleteTask(taskId) {
    if (!this.#findTask(taskId)) return false;
    Task.freeID(taskId);
    this.#tasks = this.#tasks.filter(task => task.id != taskId);
    return true;
  }

  editTask(taskId, taskJson) {
    let task = this.#findTask(taskId);
    if (!task) return false;
    task.name = taskJson.name;
    task.description = taskJson.description;
    task.dueDate = taskJson.dueDate;
    return true;
  }

  /**
   * Edit the name of a task
   * @param {Number} taskId id of task to edit
   * @param {String} newName new name for the task
   * @returns {Boolean} true if task was found and edited, false otherwise
   */
  editTaskName(taskId, newName) {
    let task = this.#findTask(taskId);
    if (!task) return false;
    task.name = newName;
    return true;
  }

  /**
   * Edit the description of a task
   * @param {Number} taskId id of task to edit
   * @param {String} newDescription new description for the task
   * @returns {Boolean} true if task was found and edited, false otherwise
   */
  editTaskDescription(taskId, newDescription) {
    let task = this.#findTask(taskId);
    if (!task) return false;
    task.description = newDescription;
    return true;
  }

  /**
   * Edit the due date of a task
   * @param {Number} taskId id of task to edit
   * @param {String} newDueDate new due date for the task
   * @returns {Boolean} true if task was found and edited, false otherwise
   */
  editTaskDueDate(taskId, newDueDate) {
    let task = this.#findTask(taskId);
    if (!task) return false;
    task.dueDate = newDueDate;
    return true;
  }

  /**
   * Convert the project to a JSON object
   * @returns {Object} JSON representation of the project
   */
  toJson() {
    return {
      id: this.#id,
      name: this.#name,
      tasks: this.#tasks.map(task => task.toJson())
    };
  }

  /**
   * Get JSON of a task from the project by id
   * @param {Number} taskId id of task to get
   * @returns {Object} JSON representation of the task
   */
  getTaskData(taskId) {
    let task = this.#findTask(taskId);
    if (!task) return undefined;
    return task.toJson();
  }

  /**
   * Find and return a task with the given id
   * @param {Number} taskId id of task to find
   * @returns {Task} the task with the given id, or undefined if not found
   */
  #findTask(taskId) {
    return this.#tasks.find(task => task.id == taskId);
  }

  /**
   * Generate new id for project
   * @returns {Number} the next available id
   */
  static #genID() {
    while (Project.#usedIds.includes(Project.#nextId)) Project.#nextId++;
    Project.#usedIds.push(Project.#nextId);
    return Project.#nextId++;
  }

  static freeID(id) {
    Project.#usedIds = Project.#usedIds.filter(usedId => usedId != id);
  }

  get id() { return this.#id; }
  get name() { return this.#name; }
  get taskCount() { return this.#tasks.length; }
  get tasks() { return this.#tasks.map(task => task.toJson()); }

  set name(name) { this.#name = name; }
}