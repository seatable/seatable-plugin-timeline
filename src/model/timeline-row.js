export default class TimelineRow {

  constructor(object = {}) {
    this.collaborator = object.collaborator || '';
    this.events = object.events || [];
  }
}