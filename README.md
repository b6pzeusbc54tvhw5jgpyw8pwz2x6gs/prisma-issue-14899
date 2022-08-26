# issue14899
This repository is for reproducing the [prisma 14899 issue](https://github.com/prisma/prisma/issues/14899).

## How to reproduce error

1. Run MySQL using Docker:

```shell
$ CONTAINER_ID=$(docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0.23)

## After waiting 20 seconds for mysql to boot,
$ docker exec $CONTAINER_ID mysql -uroot -proot -e "create database local_db"
$ docker exec $CONTAINER_ID mysql -uroot -proot -e "create database local_db_shadow"
```

2. Initialize DB Schema with Prisma:

```shell
$ export DB_URL_WITH_CREDENTIALS=mysql://root:root@localhost:3306/local_db
$ export SHADOW_DB_URL_WITH_CREDENTIALS=mysql://root:root@localhost:3306/local_db_shadow
$ npx prisma migrate dev --name create-tables
```

3. Insert sample contents to check non-error case:

```shell
$ node insert-data1.js
```

4. Run test.js to check success results.

```shell
$ node test.js

Query: SELECT `local_db`.`project`.`project_id` FROM `local_db`.`project` WHERE 1=1
Params: []
Duration: 3ms
Query: SELECT `local_db`.`deployment`.`project_id`, `local_db`.`deployment`.`deployment_id`, `local_db`.`deployment`.`created_at` FROM `local_db`.`deployment` WHERE `local_db`.`deployment`.`project_id` IN (?,?) ORDER BY `local_db`.`deployment`.`created_at` DESC
Params: ["p1","p2"]
Duration: 4ms
[
  {
    "projectId": "p1",
    "deployments": [
      {
        "projectId": "p1",
        "deploymentId": "d1",
        "createdAt": "2022-08-26T17:49:55.051Z"
      },
      {
        "projectId": "p1",
        "deploymentId": "d2",
        "createdAt": "2022-08-26T17:49:55.051Z"
      }
    ]
  },
  {
    "projectId": "p2",
    "deployments": [
      {
        "projectId": "p2",
        "deploymentId": "d1",
        "createdAt": "2022-08-26T17:49:55.051Z"
      },
      {
        "projectId": "p2",
        "deploymentId": "d2",
        "createdAt": "2022-08-26T17:49:55.051Z"
      }
    ]
  }
]
```

5. To reproduce this error, insert a Deployment record with a projectId `P1` using a capital `P`.

```shell
$ node insert-data2.js
```

Then, when you run test.js again, you can reproduce the error.

```shell
$ node test.js

Query: SELECT `local_db`.`project`.`project_id` FROM `local_db`.`project` WHERE 1=1
Params: []
Duration: 3ms
thread 'tokio-runtime-worker' panicked at 'Expected parent IDs to be set when ordering by parent ID.', query-engine/core/src/interpreter/query_interpreters/inmemory_record_processor.rs:69:18
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
Query: SELECT `local_db`.`deployment`.`project_id`, `local_db`.`deployment`.`deployment_id`, `local_db`.`deployment`.`created_at` FROM `local_db`.`deployment` WHERE `local_db`.`deployment`.`project_id` IN (?,?) ORDER BY `local_db`.`deployment`.`created_at` DESC
Params: ["p1","p2"]
Duration: 3ms
PrismaClientRustPanicError:
Invalid `db.project.findMany()` invocation in
/Users/alfred/projects/issue14899/test.js:14:37

  11 })
  12
  13 const run = async () => {
→ 14   const projects = await db.project.findMany(
  Expected parent IDs to be set when ordering by parent ID.

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

https://github.com/prisma/prisma/issues/new?body=Hi+Prisma+Team%21+My+Prisma+Client+just+crashed.+This+is+the+report%3A%0A%23%23+Versions%0A%0A%7C+Name++++++++++++%7C+Version++++++++++++%7C%0A%7C-----------------%7C-----------...

If you want the Prisma team to look into it, please open the link above 🙏
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue.

    at RequestHandler.handleRequestError (/Users/alfred/projects/issue14899/node_modules/@prisma/client/runtime/index.js:28846:13)
    at RequestHandler.request (/Users/alfred/projects/issue14899/node_modules/@prisma/client/runtime/index.js:28820:12)
    at async PrismaClient._request (/Users/alfred/projects/issue14899/node_modules/@prisma/client/runtime/index.js:29753:16)
    at async run (/Users/alfred/projects/issue14899/test.js:14:20) {
  clientVersion: '4.2.1'
}
```