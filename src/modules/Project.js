import Task from "./Task";

export default class Project {
  #id;
  #name;
  #tasks = [];
  static #nextId = 0;

  /**
   * Create a new project
   * @param {String} name name of the project
   */
  constructor(name) {
    this.#id = Project.#genID();
    this.#name = name;
  }

  /**
   * Add a new task to the project
   * @param {JSON} taskJson JSON object containing task data
   * @returns {Number} the id of the new task
   */
  addTask(taskJson) {
    taskJson.projectId = this.#id;
    let task = new Task(taskJson);
    this.#tasks.push(task);
    return task.id;
  }

  /**
   * Toggle the completed status of a task
   * @param {Number} taskId id of task to toggle
   * @returns {Boolean} the new completed status of the task
   */
  toggleTask(taskId) {
    let task = this.#tasks.find(task => task.id == taskId);
    return task.toggleCompleted();
  }

  /**
   * Delete a task from the project
   * @param {Number} taskId id of task to delete
   */
  deleteTask(taskId) {
    this.#tasks = this.#tasks.filter(task => task.id != taskId);
  }

  /**
   * Convert the project to a JSON object
   * @returns {JSON} JSON representation of the project
   */
  toJson() {
    return {
      id: this.#id,
      name: this.#name,
      tasks: this.#tasks.map(task => task.toJson())
    };
  }

  /**
   * Get a task from the project by id
   * @param {Number} taskId id of task to get
   * @returns {Task} the task with the given id
   */
  getTask(taskId) {
    return this.#tasks.find(task => task.id == taskId);
  }

  /**
   * Generate new id for project
   * @returns {Number} the next available id
   */
  static #genID() { return Project.#nextId++; }

  get id() { return this.#id; }
  get name() { return this.#name; }
  get tasks() { return this.#tasks; }
  get taskCount() { return this.#tasks.length; }
  get completedTasks() { return this.#tasks.filter(task => task.completed); }
  get activeTasks() { return this.#tasks.filter(task => !task.completed); }

  set name(name) { this.#name = name; }
}