import {defineType, defineField} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    {
      name: 'seo',
      title: 'Page SEO Settings',
    },
    {
      name: 'hero',
      title: 'Hero',
    },
    {
      name: 'tagline',
      title: 'Tagline',
    },
    {
      name: 'solutions',
      title: 'Solutions',
    },
    {
      name: 'productHighlight',
      title: 'Product Highlight (Used for products homepage section)',
    },
    {
      name: 'cards',
      title: 'Page Cards',
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'hero',
    }),

    defineField({
      name: 'nameAddition',
      title: 'Product Name Addition',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'hero',
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
      group: 'hero',
    }),

    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first in navigation (e.g., 1, 2, 3)',
      validation: (Rule) => Rule.required().min(0).integer(),
      group: 'hero',
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
      name: 'productSymbol',
      title: 'Product Symbol (SVG)',
      type: 'file',
      options: {
        accept: 'image/svg+xml',
      },
      //validation: (Rule) => Rule.required(),
      group: 'hero',
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
      group: 'productHighlight',
    }),

    // Product Hero
    defineField({
      name: 'hero',
      title: 'Product Hero',
      type: 'object',
      fields: [
        {name: 'videoSrc', title: 'Video URL', type: 'string'},
        {name: 'videoSrcMobile', title: 'Mobile Video URL', type: 'string'},
      ],
      group: 'hero',
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
      group: 'tagline',
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
      group: 'solutions',
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
      group: 'cards',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'productSymbol',
    },
  },
})
