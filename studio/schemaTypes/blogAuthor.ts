import {defineType, defineField} from 'sanity'

export const blogAuthor = defineType({
  name: 'blogAuthor',
  title: 'Blog Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
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

    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          title: 'Twitter',
          type: 'url',
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
        },
        {
          name: 'github',
          title: 'GitHub',
          type: 'url',
        },
        {
          name: 'website',
          title: 'Website',
          type: 'url',
        },
      ],
    }),

    defineField({
      name: 'role',
      title: 'Role/Title',
      type: 'string',
    }),

    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'avatar',
    },
  },
})
