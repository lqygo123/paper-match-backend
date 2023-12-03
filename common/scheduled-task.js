const cron = require('node-cron');


const startScheduledTask = () => { 
  console.log('Starting scheduled task');
  cron.schedule('* * * * *', () => {

  });

  cron.schedule('0 0 * * *', async () => {

  });
}

exports.startScheduledTask = startScheduledTask;



