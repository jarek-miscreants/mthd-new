import {defineType, defineField} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
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
      name: 'mission',
      title: 'Mission',
    },
    {
      name: 'architecture',
      title: 'Architecture',
    },
    {
      name: 'deploy',
      title: 'Deploy',
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
      group: 'hero',
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
      group: 'mission',
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
      group: 'architecture',
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
        {name: 'videoSrc', title: 'Video Src', type: 'string'},
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
      group: 'deploy',
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
      group: 'cards',
    }),
  ],
})
