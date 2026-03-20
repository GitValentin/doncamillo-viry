import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Produit',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Pizza base tomate', value: 'base_tomate' },
          { title: 'Pizza base crème', value: 'base_creme' },
          { title: 'Spécialité', value: 'specialite' },
          { title: 'Sandwich', value: 'sandwich' },
          { title: 'Dessert', value: 'dessert' },
          { title: 'Salade', value: 'salade' },
          { title: 'Boisson', value: 'boisson' },
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'composition',
      title: 'Composition',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Prix',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'priceSurPlace',
      title: 'Prix sur place',
      type: 'number',
      description: 'Uniquement pour les produits à double tarification (ex: salades)',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isHomemade',
      title: 'Fait Maison',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
})
