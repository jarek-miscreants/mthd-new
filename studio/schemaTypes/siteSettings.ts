import {defineType, defineField} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {
      name: 'headerNavigation',
      title: 'Header Navigation',
    },
    {
      name: 'footerNavigation',
      title: 'Footer Navigation',
    },
    {
      name: 'socialMedia',
      title: 'Social Media',
    },
  ],
  fields: [
    // Header Navigation
    defineField({
      name: 'headerNavItems',
      title: 'Header Navigation Items',
      description: 'Non-product nav items (Products dropdown is auto-generated)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Label', type: 'string'},
            {name: 'href', title: 'Link', type: 'string'},
            {
              name: 'btnStyle',
              title: 'Button Style',
              description: 'Show the link as button style if required.',
              type: 'boolean',
            },
            {
              name: 'target',
              title: 'Target',
              type: 'string',
              options: {
                list: [
                  {title: 'Same Window', value: '_self'},
                  {title: 'New Window', value: '_blank'},
                ],
              },
            },
            {
              name: 'dropdown',
              title: 'Dropdown Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {name: 'label', title: 'Label', type: 'string'},
                    {name: 'href', title: 'Link', type: 'string'},
                    {
                      name: 'target',
                      title: 'Target',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Same Window', value: '_self'},
                          {title: 'New Window', value: '_blank'},
                        ],
                      },
                    },
                    {
                      name: 'arrowIndicator',
                      title: 'Arrow Indicator',
                      description:
                        'Show arrow indicator. Used for links moving away from the site.',
                      type: 'boolean',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      group: 'headerNavigation',
    }),

    // Footer Branding
    defineField({
      name: 'footerName',
      title: 'Footer Name',
      type: 'string',
      group: 'footerNavigation',
    }),

    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'string',
      group: 'footerNavigation',
    }),

    defineField({
      name: 'copyrightTag',
      title: 'Copyright Tag',
      type: 'string',
      group: 'footerNavigation',
    }),

    // Footer CTAs
    defineField({
      name: 'footerCtas',
      title: 'Footer CTAs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Label', type: 'string'},
            {name: 'href', title: 'Link', type: 'string'},
            {
              name: 'target',
              title: 'Target',
              type: 'string',
              options: {
                list: [
                  {title: 'Same Window', value: '_self'},
                  {title: 'New Window', value: '_blank'},
                ],
              },
            },
          ],
        },
      ],
      group: 'footerNavigation',
    }),

    // Footer Navigation Groups
    defineField({
      name: 'footerNavGroups',
      title: 'Footer Navigation Groups',
      description: 'Product and legal groups are auto-generated',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'groupLabel', title: 'Group Label', type: 'string'},
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {name: 'label', title: 'Label', type: 'string'},
                    {name: 'href', title: 'Link', type: 'string'},
                    {
                      name: 'target',
                      title: 'Target',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Same Window', value: '_self'},
                          {title: 'New Window', value: '_blank'},
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      group: 'footerNavigation',
    }),

    // Mobile Menu Cards
    defineField({
      name: 'mobileMenuCards',
      title: 'Mobile Menu Cards',
      type: 'array',
      of: [{type: 'card'}],
      group: 'headerNavigation',
    }),

    // Social Media
    defineField({
      name: 'socialLinkPreviewImage',
      title: 'Social Link Preview Image',
      description: 'Image displayed when sharing links on social media',
      type: 'image',
      group: 'socialMedia',
    }),

    defineField({
      name: 'socialLinkPreviewTitle',
      title: 'Social Link Preview Title',
      description: 'Title displayed when sharing links on social media',
      type: 'string',
      group: 'socialMedia',
    }),

    defineField({
      name: 'socialLinkPreviewDescription',
      title: 'Social Link Preview Description',
      description: 'Description displayed when sharing links on social media',
      type: 'text',
      group: 'socialMedia',
    }),

    defineField({
      name: 'socialLinkPreviewUrl',
      title: 'Social Link Preview URL',
      description: 'URL displayed when sharing links on social media',
      type: 'url',
      group: 'socialMedia',
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})
