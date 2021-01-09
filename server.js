const express = require('express');
const health = require('./health-check');

const PORT = 8000;
const HOST = '127.0.0.1';

const app = express();
app.set('json spaces', 2);

health.initHealthChecks('my server', [
  {
    kind: health.CHECK_KIND.MONGODB_URI,
    name: 'MongoDB',
    uri: 'mongodb://localhost:27017/mydb'
  },
  {
    kind: health.CHECK_KIND.HOST_PORT_URI,
    name: 'Kafka',
    uri: 'localhost:9092'
  },
  {
    kind: health.CHECK_KIND.HOST_PORT_SEPARATE,
    name: 'Google',
    host: 'google.com',
    port: 80
  }
]);

app.get('/', health.indexHandler);
app.get('/health', health.healthcheckHandler);

app.listen(PORT, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
