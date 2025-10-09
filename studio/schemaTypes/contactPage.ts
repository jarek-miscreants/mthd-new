import {defineType, defineField} from 'sanity'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
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
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
    }),

    defineField({
      name: 'text',
      title: 'Description Text',
      type: 'text',
    }),

    defineField({
      name: 'cards',
      title: 'Contact Cards',
      type: 'array',
      of: [
        {
          type: 'card',
        },
      ],
    }),
  ],
})
