import {defineType, defineField} from 'sanity'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
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
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      group: 'cards',
    }),

    defineField({
      name: 'text',
      title: 'Description Text',
      type: 'text',
      group: 'cards',
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
      group: 'cards',
    }),
  ],
})
