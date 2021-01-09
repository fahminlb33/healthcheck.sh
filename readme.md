# healthcheck\.sh

Script to check service health (by health means connection to
outside service). Currently supports TCP checks using netcat.
When a host is not reachable from inside a container, this
script will return exit code 1 and causes the container to
shut down and roll out new container.

**NEW!** healthcheck.sh now has a JavaScript implementation!
You can simply copy `health-check.js` into your NodeJS app
and confingure your express-compatible app to add a health
check API. See `server.js` for an example.

## Available functions

For the shell version, the available functions is:

```sh
run_check [host] [port] [description]
run_check_host_port [host:port] [description]
run_check_mongodb [mongodb URI]
```

Note

Current implementation for MongoDB URI **must** follow this rule:
`mongodb://user:password@host:port/databasename`. Other version of
this URI format is currently not suported.

For the JS version, the `health-check.js` module has four exports:

```js
initHealthChecks(name: String, tasks: Array);
indexHandler(req: Request, res: Response);
healthcheckHandler(req: Request, res: Response);
CHECK_KIND = Object.freeze({
  HOST_PORT_SEPARATE: 0,
  HOST_PORT_URI: 1,
  MONGODB_URI: 2,
});
```

Note:

The `tasks` parameter expect you to provide an array of object with
the following properties:

```js
[
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
]
```

You can choose from three available `CHECK_KIND` type.

## Examples

### `healthcheck.sh` Example

For the shell version, copy the `healthcheck.sh` into your root directory,
then edit the script at the bottom of `# >>-----> Run checks` to match
your components.

Below is an example to run health checks using values from environment variable.

```sh
# >>-----> Run checks

# check kafka (host:port)
run_check_host_port $(printenv KAFKA_HOST) Kafka

# check mongodb (mongodb URI format)
run_check_mongodb $(printenv MONGO_HOST)

# check redis
run_check $(printenv REDIS_HOST) $(printenv REDIS_PORT) Redis

# check minio
run_check minio.myserver.com 80 Minio
```

### `health-check.js` Example

For the JavaScript version, you might need to edit the handler function
in `health-check.js` file with respect to your server library. For example
if you're using Express then you don't need to change anything, but if
you use Restify or other library, please change the `indexHandler` and
`healthcheckHandler` accordingly.

In essence you just have to import the module and then call
`initHealthChecks`, specifying server name and what component to check.
After that, you have to register a route with `healthcheckHandler`. The
`indexHandler` is optional.

For a working example using Express, you can see [server.js](https://github.com/fahminlb33/healthcheck.sh/blob/master/server.js).
If you're using this JS script, you can also integrate this script
response with [playcourt-tricks](https://github.com/fahminlb33/playcourt-tricks).
Playcourt tricks is a dashboard web app to view your API health.
