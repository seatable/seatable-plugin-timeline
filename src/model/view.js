export default class View {

  constructor(object = {}) {
    this._id = object._id;
    this.name = object.name;
    this.settings = object.settings || {};
  }
}
