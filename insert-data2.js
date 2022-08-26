const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
})

db.$on('query', e => {
  console.log(`Query: ${e.query}`)
  console.log(`Params: ${e.params}`)
  console.log(`Duration: ${e.duration}ms`)
})

const run = async () => {
  await db.deployment.create({ data: { projectId: 'p1', deploymentId: 'd3' }})
  // use uppercase 'P1'
  await db.deployment.create({ data: { projectId: 'P1', deploymentId: 'd4' }})
  await db.deployment.create({ data: { projectId: 'p1', deploymentId: 'd5' }})
}

if (require.main === module) {
  run().catch(console.error)
}
