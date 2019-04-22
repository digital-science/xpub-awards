const { deferConfig } = require('config/defer')

module.exports = {
  dbManager: {
    username: 'admin',
    password: 'password',
    email: 'hindawi+admin@thinslices.com',
    admin: true,
  },
  journal: {
    name: `[QA]${deferConfig(cfg => cfg.journalConfig.metadata.nameText)}`,
    staffEmail: 'hindawi+admin@thinslices.com',
  },
}
