export default class Task {
  #id;
  #projectId;
  #name;
  #description;
  #creationDate;
  #dueDate;
  #completed;
  static #nextId = 0;

  /**
   * Create a new task
   * @param {String} projectId id of parent project
   * @param {String} name name of task
   * @param {String} description short description of task
   * @param {Date} creationDate date task was created, default is current date
   * @param {Date} dueDate date task is due, default is null
   * @param {Boolean} completed status of task, default is false
   */
  constructor(projectId, name, description, creationDate = Date.now(), dueDate = null, completed = false) {
    this.#id = Task.#genID();
    this.#projectId = projectId;
    this.#name = name;
    this.#description = description;
    this.#creationDate = creationDate;
    this.#dueDate = dueDate;
    this.#completed = completed;
  }

  /**
   * Toggle the completed status of the task
   * @returns {Boolean} the new completed status
   */
  toggleCompleted() {
    this.#completed = !this.#completed;
    return this.#completed;
  }

  /**
   * Convert the task to a JSON object
   * @returns {JSON} JSON representation of the task
   */
  toJson() {
    return {
      id: this.#id,
      projectId: this.#projectId,
      name: this.#name,
      description: this.#description,
      creationDate: this.#creationDate,
      dueDate: this.#dueDate,
      completed: this.#completed
    };
  }

  /**
   * Generate new id for task
   * @returns {Number} the next available id
   */
  static #genID() { return Task.#nextId++; }

  get id() { return this.#id; }
  get projectId() { return this.#projectId; }
  get name() { return this.#name; }
  get description() { return this.#description; }
  get creationDate() { return this.#creationDate; }
  get dueDate() { return this.#dueDate; }
  get completed() { return this.#completed; }
  get overdue() {
    if (this.#completed || this.#dueDate === null) return false;
    else return (Date.now() > this.#dueDate);
  }

  set projectId(projectId) { this.#projectId = projectId; }
  set name(name) { this.#name = name; }
  set description(description) { this.#description = description; }
  set dueDate(dueDate) { this.#dueDate = dueDate; }
}