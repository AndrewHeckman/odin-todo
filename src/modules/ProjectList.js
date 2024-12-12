import Project from './Project';

export default class ProjectList {
  #projects = [];

  /**
   * Create new project list
   * @param {Object} projectListJson object containing project list data
   * @param {Array<Object>=} projectListJson.projects array of project objects, default: []
   */
  constructor({ projects = [] }) {
    this.addProject({ name: "Inbox" });
    projects.forEach(project => this.addProject(project));
  }

  /**
   * Add a new project to the project list
   * @param {Object} projectJson object containing project data
   * @param {String} projectJson.name name of the project
   * @param {Array<Object>=} projectJson.tasks array of task objects, default: []
   * @returns {Number} the id of the new project
   */
  addProject(projectJson) {
    if (!projectJson.name) return undefined;
    let project = new Project(projectJson);
    this.#projects.push(project);
    return project.id;
  }

  /**
   * Delete a project from the project list
   * @param {Number} projectId id of project to delete
   * @returns {Boolean} true if project was found and deleted, false otherwise
   */
  deleteProject(projectId) {
    if (!this.#findProject(projectId)) return false;
    this.#projects = this.#projects.filter(project => project.id != projectId);
    return true;
  }

  /**
   * Edit the name of a project
   * @param {Number} projectId id of project to edit
   * @param {String} newName new name for the project
   * @returns {Boolean} true if project was found and edited, false otherwise
   */
  editProjectName(projectId, newName) {
    let project = this.#findProject(projectId);
    if (!project) return false;
    project.name = newName;
    return true;
  }

  /**
   * Add a new task to a project
   * @param {Number} projectId id of project to add task to
   * @param {Object} taskJson JSON object containing task data
   * @returns {Number} the id of the new task
   */
  addTask(projectId, taskJson) {
    let project = this.#findProject(projectId);
    if (!project) return undefined;
    return project.addTask(taskJson);
  }

  /**
   * Delete a task from a project
   * @param {Number} projectId id of project to delete task from
   * @param {Number} taskId id of task to delete
   * @returns {Boolean} true if task was found and deleted, false otherwise
   */
  deleteTask(projectId, taskId) {
    let project = this.#findProject(projectId);
    if (!project) return false;
    return project.deleteTask(taskId);
  }

  /**
   * Edit the name of a task
   * @param {Number} projectId id of project to edit task in
   * @param {Number} taskId id of task to edit
   * @param {String} newName new name for the task
   * @returns {Boolean} true if task was found and edited, false otherwise
   */
  editTaskName(projectId, taskId, newName) {
    let project = this.#findProject(projectId);
    if (!project) return false;
    return project.editTaskName(taskId, newName);
  }

  /**
   * Edit the description of a task
   * @param {Number} projectId id of project to edit task in
   * @param {Number} taskId id of task to edit
   * @param {String} newDescription new description for the task
   * @returns {Boolean} true if task was found and edited, false otherwise
   */
  editTaskDescription(projectId, taskId, newDescription) {
    let project = this.#findProject(projectId);
    if (!project) return false;
    return project.editTaskDescription(taskId, newDescription);
  }

  /**
   * Edit the due date of a task
   * @param {Number} projectId id of project to edit task in
   * @param {Number} taskId id of task to edit
   * @param {Date} newDueDate new due date for the task
   * @returns {Boolean} true if task was found and edited, false otherwise
   */
  editTaskDueDate(projectId, taskId, newDueDate) {
    let project = this.#findProject(projectId);
    if (!project) return false;
    return project.editTaskDueDate(taskId, newDueDate);
  }

  /**
   * Toggle the completed status of a task
   * @param {Number} projectId id of project to toggle task in
   * @param {Number} taskId id of task to toggle
   * @returns {Boolean} true if task was found and toggled, false otherwise
   */
  toggleTask(projectId, taskId) {
    let project = this.#findProject(projectId);
    if (!project) return false;
    return project.toggleTask(taskId);
  }

  /**
   * Move a task from one project to another
   * @param {Number} projectId id of project to move task from
   * @param {Number} taskId id of task to move
   * @param {Number} newProjectId id of project to move task to
   * @returns {Boolean} true if task was found and moved, false otherwise
   */
  moveTask(projectId, taskId, newProjectId) {
    let project = this.#findProject(projectId);
    let newProject = this.#findProject(newProjectId);
    if (!project || !newProject) return false;

    let task = project.getTaskData(taskId);
    if (!task) return false;

    project.deleteTask(taskId);
    newProject.addTask(task);
    return true;
  }

  /**
   * Convert the project list to a JSON object
   * @returns {Object} JSON representation of the project list
   */
  toJson() {
    return { projects: this.#projects.map(project => project.toJson()) };
  }

  /**
   * Get JSON of a project from the project list
   * @param {Number} projectId id of project to get data of
   * @returns {Object} JSON representation of the project
   */
  getProjectData(projectId) {
    let project = this.#findProject(projectId);
    return project ? project.toJson() : undefined;
  }

  /**
   * Get JSON of a task from a project
   * @param {Number} projectId id of project to get task data from
   * @param {Number} taskId id of task to get data of
   * @returns {Object} JSON representation of the task
   */
  getTaskData(projectId, taskId) {
    let project = this.#findProject(projectId);
    return project ? project.getTaskData(taskId) : undefined;
  }

  /**
   * Find and return a project with the given id
   * @param {Number} projectId id of project to find
   * @returns {Project} the project with the given id, or undefined if not found
   */
  #findProject(projectId) {
    return this.#projects.find(project => project.id == projectId);
  }
}