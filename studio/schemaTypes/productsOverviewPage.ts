import {defineType, defineField} from 'sanity'

export const productsOverviewPage = defineType({
  name: 'productsOverviewPage',
  title: 'Products Overview Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    //SEO
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      options: {collapsible: true, collapsed: false},
    }),

    defineField({
      name: 'cards',
      title: 'Bottom Cards',
      type: 'array',
      of: [{type: 'card'}],
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'Products Overview Page',
      }
    },
  },
})
