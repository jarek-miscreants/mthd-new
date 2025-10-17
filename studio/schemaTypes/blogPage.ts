import {defineType, defineField} from 'sanity'

export const blogPage = defineType({
  name: 'blogPage',
  title: 'Blog Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),

    defineField({
        name: 'eyebrow',
        title: 'Eyebrow',
        type: 'string',
    }),

    defineField({
      name: 'subscribeButtonText',
      title: 'Subscribe Button Text',
      type: 'string',
    }),

    defineField({
      name: 'subscribeButtonLink',
      title: 'Subscribe Button Link',
      type: 'string',
    }),

    //SEO
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      options: {collapsible: true, collapsed: false},
    }),
  ],

  preview: {
    select: {
      title: 'title',
    },
  },
})
