import {defineType, defineField} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
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

    // Hero Section
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Title', type: 'string'},
        {name: 'videoSrc', title: 'Video Path', type: 'string'},
        {name: 'videoSrcMobile', title: 'Mobile Video Path', type: 'string'},
      ],
    }),

    // Mission Section
    defineField({
      name: 'mission',
      title: 'Mission Section',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
        {name: 'title', title: 'Title', type: 'text'},
        {name: 'leadParagraph', title: 'Lead Paragraph', type: 'text'},
      ],
    }),

    // Architecture Section
    defineField({
      name: 'architecture',
      title: 'Architecture Section',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
        {name: 'title', title: 'Title', type: 'string'},
        {
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'title', title: 'Title', type: 'string'},
                {name: 'subtext', title: 'Subtext', type: 'text'},
              ],
            },
          ],
        },
      ],
    }),

    // Deploy Section
    defineField({
      name: 'deploy',
      title: 'Deploy Section',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
        {name: 'title', title: 'Title', type: 'string'},
        {name: 'leadParagraph', title: 'Lead Paragraph', type: 'text'},
        {
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'indexDeco', title: 'Index Decoration', type: 'string'},
                {name: 'title', title: 'Title', type: 'string'},
                {name: 'text', title: 'Text', type: 'text'},
                {name: 'cta', title: 'Show CTA Button', type: 'boolean'},
              ],
              preview: {
                select: {
                  indexDeco: 'indexDeco',
                  title: 'title',
                },
                prepare({indexDeco, title}) {
                  return {
                    subtitle: indexDeco || 'No index decoration',
                    title: title || 'Untitled',
                  }
                },
              },
            },
          ],
        },
      ],
    }),

    // Card Section
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
})
