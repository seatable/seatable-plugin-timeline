import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

class TaskList {

  static execute() {
    const root = createRoot(document.querySelector('#plugin-wrapper'));
    root.render(<App showDialog={true} />);
  }

}

export default TaskList;

window.app.registerPluginItemCallback('timeline', TaskList.execute);
