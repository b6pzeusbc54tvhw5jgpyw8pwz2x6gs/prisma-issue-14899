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
  const projects = await db.project.findMany({
    select: {
      projectId: true,
      deployments: {
        take: 15,
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  console.log(JSON.stringify(projects, null, 2))
}

if (require.main === module) {
  run().catch(console.error)
}

