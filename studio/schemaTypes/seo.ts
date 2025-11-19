import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO Configuration',
  type: 'object',
  groups: [
    {name: 'essential', title: 'Essential SEO'},
    {name: 'social', title: 'Social Sharing'},
  ],
  fields: [
    // Essentials
    defineField({
      name: 'title',
      title: 'Title Tag',
      type: 'string',
      description: '50–60 characters recommended',
      validation: (Rule) => Rule.required().min(4).max(70),
      group: 'essential',
    }),
    defineField({
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: '120–160 characters recommended',
      validation: (Rule) => Rule.required().min(20).max(170),
      group: 'essential',
    }),

    // Social Sharing (Open Graph & Twitter)
    defineField({
      name: 'ogImage',
      title: 'Social Sharing Image',
      type: 'image',
      description: '1200×630 px recommended',
      options: {hotspot: true},
      group: 'social',
    }),
    defineField({
      name: 'ogTitle',
      title: 'Social Title Override',
      type: 'string',
      validation: (Rule) => Rule.max(70),
      group: 'social',
    }),
    defineField({
      name: 'ogDescription',
      title: 'Social Description Override',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(170),
      group: 'social',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'ogImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Untitled SEO',
        subtitle: subtitle ? `${subtitle.slice(0, 90)}…` : 'No description',
        media,
      }
    },
  },
})
