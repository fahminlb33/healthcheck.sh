#!/bin/sh

#
#   >> healthcheck.sh <<
#   Created by Fahmi Noor Fiqri (fahminlb33) CHAPTER DEV
#
#   Script to check service health (by health means connection to outside service)
#   Currently supports TCP checks using netcat.
#
#   Available functions:
#     run_check [host] [port] [description]
#     run_check [host:port] [description]
#     run_check_mongodb [mongodb URI]
#
#   How to use: https://github.com/fahminlb33/healthcheck.sh
#
#   Changelog:
#     03/11/2020 - Initial release
#

# >>-----> Health functions

# How to: run_check [host] [port] [description]
run_check()
{
  HOST=$1
  PORT=$2
  shift; shift
  DESCRIPTION=$@

  nc -z -w3 $HOST $PORT >/dev/null 2>&1
  if [ $? -eq 0 ]
  then
    echo "Liveness OK for ($DESCRIPTION)"
  else
    echo "Liveness error for ($DESCRIPTION)" >&2
    exit 1
  fi
}

# How to: run_check [host:port] [description]
run_check_host_port()
{
  HOST=$(echo $1 | awk '{split($0,a,":"); print a[1]}')
  PORT=$(echo $1 | awk '{split($0,a,":"); print a[2]}')
  shift
  DESCRIPTION=$@

  if [ "${HOST}" ] && [ "${PORT}" ]
  then
    run_check $HOST $PORT $DESCRIPTION
  else
    echo "Health check for host:port ($DESCRIPTION) is skipped."
  fi
}

# How to: run_check_mongodb mongodb://user:password@host:port/databasename
run_check_mongodb()
{
  HOST_PORT=$(echo $1 | awk -F'@' '{ print $2 }' | awk -F'/' '{ print $1 }')
  DESCRIPTION=$(echo $HOST_PORT | awk -F':' '{ print $1 }')

  if [ "${HOST_PORT}" ]
  then
    run_check_host_port $HOST_PORT $DESCRIPTION
  else
    echo "Health check for MongoDB is skipped."
  fi
}

# >>-----> Run checks

# check kafka (host:port)
run_check_host_port $(printenv KAFKA_HOST) Kafka

# check mongodb (mongodb URI format)
run_check_mongodb $(printenv MONGO_HOST)

# check redis
run_check $(printenv REDIS_HOST) $(printenv REDIS_PORT) Redis

# check minio
run_check $(printenv MINIO_END_POINT) $(printenv MINIO_PORT) Minio
