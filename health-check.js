const net = require('net');
const ctx = 'Healthcheck';

const config = {
  name: '',
  tasks: []
};

const CHECK_KIND = Object.freeze({
  HOST_PORT_SEPARATE: 0,
  HOST_PORT_URI: 1,
  MONGODB_URI: 2,
});

// ----- Internal Methods

const internalSocketConnectAsync = (host, port) => {
  return new Promise((resolve, reject) => {
    const sock = new net.Socket();
    sock.on('error', (ex) => {
      sock.destroy();
      reject(ex);
    });
    sock.setTimeout(1000, () => {
      sock.end();
      reject(new Error('Timeout'));
    });
    sock.connect(port, host, () => {
      sock.end();
      resolve();
    });
  });
};

const parseHostPort = (hp) => {
  const splitted = hp.split(':');
  return {
    host: splitted[0],
    port: parseInt(splitted[1])
  };
};

const parseMongoUri = (uri) => {
  const pattern = uri.includes('@') ? /@(.*):(.*)\//g : /\/\/(.*):(.*)\//g;
  const mongoHost = pattern.exec(uri);
  return {
    host: mongoHost[1],
    port: parseInt(mongoHost[2])
  };
};

const buildResponse = (success, uri, components) => {
  return {
    name: config.name,
    uri: uri,
    status: 'Service is ' + (success ? 'healthy.' : 'unhealthy.'),
    healthy: success,
    lastUpdate: new Date().toISOString(),
    components
  };
}

// ----- Public Methods

const initHealthChecks = (name, tasks) => {
  config.name = name;
  config.tasks.push(...tasks);
};

const indexHandler = (req, res) => {
  res.status(200).send('This service is running properly');
};

const healthcheckHandler = (req, res) => {
  const checkPerformed = [];
  const promises = config.tasks
    .map(task => {
      let hostToCheck = {
        host: '',
        port: 0
      };

      if (task.kind === CHECK_KIND.HOST_PORT_SEPARATE) {
        hostToCheck.host = task.host;
        hostToCheck.port = task.port;
      } else if (task.kind === CHECK_KIND.HOST_PORT_URI) {
        hostToCheck = parseHostPort(task.uri);
      } else if (task.kind === CHECK_KIND.MONGODB_URI) {
        hostToCheck = parseMongoUri(task.uri);
      }

      return internalSocketConnectAsync(hostToCheck.host, hostToCheck.port)
        .then(x => checkPerformed.push({
          name: task.name,
          healthy: true
        }))
        .catch(x => checkPerformed.push({
          name: task.name,
          healthy: false
        }));
    });

  const uri = req.protocol + '://' + req.get('host') + req.originalUrl;
  Promise.all(promises)
    .catch(ex => {
      res.status(502).json(buildResponse(false, uri, checkPerformed));
    })
    .then(() => {
      if (checkPerformed.length === 0) {
        res.status(200).json(buildResponse(true, uri, checkPerformed));
      } else {
        res.status(502).json(buildResponse(false, uri, checkPerformed));
      }
    });
};

module.exports = {
  CHECK_KIND,

  initHealthChecks,
  indexHandler,
  healthcheckHandler
};
