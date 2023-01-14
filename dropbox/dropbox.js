const { Dropbox } = require('dropbox');
const dbx = new Dropbox({
  clientId: 'o2r68tzh71bgj24',
  clientSecret: process.env.DBX_CLIENT_SECRET,
  refreshToken: process.env.DBX_REFRESH_TOKEN,
});

module.exports = {dbx}