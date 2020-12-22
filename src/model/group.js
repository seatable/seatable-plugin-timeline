export default class Group {

  constructor(object = {}) {
    this.cell_value = object.cell_value || '';
    this.column_name = object.column_name || '';
    this.column_key = object.column_key || '';
    this.subgroups = object.subgroups || null;
    this.min_date = object.min_date || '';
    this.max_date = object.max_date || '';
    this.rows = object.rows || [];
  }
}