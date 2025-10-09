import {defineType, defineField} from 'sanity'

export const companyPage = defineType({
  name: 'companyPage',
  title: 'Company Page',
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
      name: 'highlightTexts',
      title: 'Highlight Texts',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
            {name: 'text', title: 'Text', type: 'text'},
          ],
        },
      ],
    }),
    defineField({
      name: 'cards',
      title: 'Bottom Cards',
      type: 'array',
      of: [{type: 'card'}],
    }),
  ],
})
