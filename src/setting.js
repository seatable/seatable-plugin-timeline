
const config = {
  APIToken: '65be605361e3fed0bd364a2596b134ed9a337e7f',
  server: 'http://127.0.0.1:80',
  workspaceID: '1',
  dtableName: 'test-1',
  lang: 'zh-cn'
};

const dtablePluginConfig = Object.assign({}, config, {server: config.server.replace(/\/+$/, '')});
window.dtablePluginConfig = dtablePluginConfig;