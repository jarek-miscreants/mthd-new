import {defineType, defineField} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'nameAddition',
      title: 'Product Name Addition',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
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
      name: 'productSymbol',
      title: 'Product Symbol (SVG)',
      type: 'file',
      options: {
        accept: 'image/svg+xml',
      },
      validation: (Rule) => Rule.required(),
    }),

    // Product Highlight (for homepage)
    defineField({
      name: 'highlight',
      title: 'Product Highlight (Homepage)',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
        {name: 'title', title: 'Title', type: 'string'},
        {name: 'leadParagraph', title: 'Lead Paragraph', type: 'text'},
        {name: 'showcaseSrc', title: 'Showcase Video URL', type: 'string'},
      ],
    }),

    // Product Hero
    defineField({
      name: 'hero',
      title: 'Product Hero',
      type: 'object',
      fields: [{name: 'videoSrc', title: 'Video URL', type: 'string'}],
    }),

    // Product Tagline
    defineField({
      name: 'tagline',
      title: 'Product Tagline',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
        {name: 'text', title: 'Text', type: 'text'},
      ],
    }),

    // Product Solutions
    defineField({
      name: 'solutions',
      title: 'Product Solutions',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
        {
          name: 'items',
          title: 'Solution Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
                {name: 'title', title: 'Title', type: 'string'},
                {name: 'text', title: 'Text', type: 'text'},
                {name: 'mediaSrc', title: 'Media URL', type: 'string'},
              ],
            },
          ],
        },
      ],
    }),

    // Bottom Cards
    defineField({
      name: 'cards',
      title: 'Bottom Cards',
      type: 'array',
      of: [
        {
          type: 'card',
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'productSymbol',
    },
  },
})
