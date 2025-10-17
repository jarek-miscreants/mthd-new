import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'method-website'
const dataset = process.env.SANITY_STUDIO_DATASET || 'development'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
})
