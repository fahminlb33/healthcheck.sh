# healthcheck.sh

Script to check service health (by health means connection to
outside service). Currently supports TCP checks using netcat.

## Available functions

```sh
run_check [host] [port] [description]
run_check_host_port [host:port] [description]
run_check_mongodb [mongodb URI]
```

Note!

Current implementation for MongoDB URI **must** follow this rule:
`mongodb://user:password@host:port/databasename`. Other version of
this URI format is currently not suported (see the source for
more info) as I'm not very well experienced with shell script :P

## How to use

1. Clone this repo.
2. Modify `healthcheck.sh` with your own checks.
3. Add HEALTHCHECK directive in your Dockerfile. For example: 
    `HEALTHCHECK --interval=5s CMD sh liveness.sh || exit 1`
4. Build and run your Docker!
5. If you're using Kubernetes or Docker Swarm, if the health check
   fails, the contailer will be shut down and spawn a new one.

### Example

Below is an example using environment variables.

```sh
# check kafka (host:port)
run_check_host_port $(printenv KAFKA_HOST) Kafka

# check mongodb (mongodb URI format)
run_check_mongodb $(printenv MONGO_HOST)

# check redis
run_check $(printenv REDIS_HOST) $(printenv REDIS_PORT) Redis

# check minio
run_check $(printenv MINIO_END_POINT) $(printenv MINIO_PORT) Minio
```

## Changelog

- v0.1 - Initial release
