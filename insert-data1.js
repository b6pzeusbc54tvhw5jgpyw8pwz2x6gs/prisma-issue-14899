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
  await db.project.createMany({ data: { projectId: 'p1' }})
  await db.project.createMany({ data: { projectId: 'p2' }})
  await db.deployment.create({ data: { projectId: 'p1', deploymentId: 'd1' }})
  await db.deployment.create({ data: { projectId: 'p1', deploymentId: 'd2' }})
  await db.deployment.create({ data: { projectId: 'p2', deploymentId: 'd1' }})
  await db.deployment.create({ data: { projectId: 'p2', deploymentId: 'd2' }})
}

if (require.main === module) {
  run().catch(console.error)
}
