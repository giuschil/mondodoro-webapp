module.exports = {
  apps: [{
    name: 'mondodoro-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/regalino.it/frontend',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

