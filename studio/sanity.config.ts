import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'method-website',

  projectId: 'stmwtpl3',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Highlight single
            S.listItem()
              .title('Site Settings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.listItem()
              .title('Home Page')
              .child(S.document().schemaType('homePage').documentId('homePage')),
            S.listItem()
              .title('Products Overview Page')
              .child(
                S.document().schemaType('productsOverviewPage').documentId('productsOverviewPage'),
              ),
            S.listItem()
              .title('Company Page')
              .child(S.document().schemaType('companyPage').documentId('companyPage')),
            S.listItem()
              .title('Contact Page')
              .child(S.document().schemaType('contactPage').documentId('contactPage')),
            S.divider(),
            // Regular documents
            S.documentTypeListItem('product').title('Products'),
            S.divider(),
            S.documentTypeListItem('legalPage').title('Legal Pages'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
