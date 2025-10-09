import {defineType, defineField} from 'sanity'

export const card = defineType({
  name: 'card',
  title: 'Card',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      //validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'target',
      title: 'Target',
      type: 'string',
      options: {
        list: [
          {title: 'Same Window', value: '_self'},
          {title: 'New Window', value: '_blank'},
        ],
      },
      initialValue: '_self',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'eyebrow',
    },
  },
})
