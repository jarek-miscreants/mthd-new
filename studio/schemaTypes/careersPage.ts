import {defineType, defineField} from 'sanity'

export const careersPage = defineType({
  name: 'careersPage',
  title: 'Careers Page',
  type: 'document',
  groups: [
    {
      name: 'seo',
      title: 'Page SEO Settings',
    },
    {
      name: 'content',
      title: 'Page Content',
    },
    {
      name: 'images',
      title: 'Page Images',
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
      group: 'content',
    }),

    defineField({
      name: 'text',
      title: 'Description Text',
      type: 'text',
      group: 'content',
    }),

    defineField({
      name: 'careersPageUrl',
      title: 'Careers Page URL',
      type: 'string',
      group: 'content',
      description: 'URL for the careers page button (e.g., link to job listings)',
    }),

    defineField({
      name: 'section1Eyebrow',
      title: 'Section 1 Eyebrow',
      type: 'string',
      group: 'content',
    }),

    defineField({
      name: 'section1Items',
      title: 'Section 1 Items',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),

    defineField({
      name: 'section2Eyebrow',
      title: 'Section 2 Eyebrow',
      type: 'string',
      group: 'content',
    }),

    defineField({
      name: 'section2Items',
      title: 'Section 2 Items',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),

    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      group: 'images',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
        defineField({
          name: 'aspectRatio',
          title: 'Aspect Ratio',
          type: 'number',
          description: 'Width ÷ Height (e.g., 1.777 for 16:9 landscape, 1 for square, 0.75 for 3:4 portrait). Calculate: image width / image height',
        }),
        defineField({
          name: 'cutAngle',
          title: 'Corner Cut Angle (degrees)',
          type: 'number',
        }),
      ],
    }),

    defineField({
      name: 'secondaryImages',
      title: 'Secondary Images',
      type: 'array',
      group: 'images',
      of: [
        {
          type: 'image',
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
            defineField({
              name: 'aspectRatio',
              title: 'Aspect Ratio',
              type: 'number',
              description: 'Width ÷ Height (e.g., 1.777 for 16:9 landscape, 1 for square, 0.75 for 3:4 portrait). Calculate: image width / image height',
            }),
            defineField({
              name: 'cutAngle',
              title: 'Corner Cut Angle (degrees)',
              type: 'number',
            }),
          ],
        },
      ],
    }),
  ],
})

