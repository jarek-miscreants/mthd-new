import {defineType, defineField} from 'sanity'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  groups: [
    {
      name: 'seo',
      title: 'Page SEO Settings',
    },
    {
      name: 'highlight',
      title: 'Highlight',
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
      group: 'highlight',
    }),
    defineField({
      name: 'cards',
      title: 'Bottom Cards',
      type: 'array',
      of: [{type: 'card'}],
      group: 'cards',
    }),
  ],
})
