import {defineType, defineField} from 'sanity'

export const productsOverviewPage = defineType({
  name: 'productsOverviewPage',
  title: 'Products Overview Page',
  type: 'document',
  groups: [
    {
      name: 'seo',
      title: 'Page SEO Settings',
    },
    {
      name: 'cards',
      title: 'Page Cards',
    },
  ],
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
      group: 'seo',
    }),

    defineField({
      name: 'cards',
      title: 'Bottom Cards',
      type: 'array',
      of: [{type: 'card'}],
      group: 'cards',
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
