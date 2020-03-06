export default class TimelineRow {

  constructor(object = {}) {
    this.user = object.user || '';
    this.events = object.events || [];
  }
}