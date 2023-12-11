const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const routes = require('./routes');
const cors = require('cors');
const { startScheduledTask } = require('./common/scheduled-task');
const config = require('./config');
const path = require('path');

const { jwtAuth } = require('./common/jwt-auth')

const app = express();
const port = config.PORT

mongoose.connect(config.MONGO_URL, config.DB_CONNECTION_OPTS);
mongoose.connection.on('connected', function() {
  console.log('Mongoose default connection connected.');
  init()
  require('./common/scheduled-task')
});

mongoose.connection.on('error', function(err) {
  console.error('Mongoose default connection error: ', err);
});

mongoose.connection.on('disconnected', function() {
  console.log('Mongoose default connection disconnected.');
});

async function init() {
  // create a default admin user
  const { User } = require('./models');
  const user = await User.findOne({ username: 'admin' });
  if (!user) {
    await User.create({
      username: 'admin',
      password: 'zxczxc',
      role: 'admin',
      enabled: true,
    });

    // create 20 default user
    const users = [];
    for (let i = 1; i <= 20; i++) {
      users.push({
        username: `user${i}`,
        password: `password`,
        role: 'user',
        enabled: true,
      })
    }
    await User.insertMany(users);
  }
  startScheduledTask()
}

app.use(cors());
app.use(morgan('dev'));
app.use(jwtAuth)
app.use('/static', express.static(path.join(__dirname, "./static")));
app.use(express.json());
app.use('/api/v1', routes);


app.listen(port, () => {
  console.log(`服务器正在监听端口 ${port}`);
});

