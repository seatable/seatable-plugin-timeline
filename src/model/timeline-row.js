export default class TimelineRow {

  constructor(object = {}) {
    this.name = object.name || '';
    this.events = object.events || [];
  }
}