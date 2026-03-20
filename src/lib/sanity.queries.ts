import { client } from '@/sanity/lib/client'

export const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(_createdAt asc) {
  _id,
  name,
  category,
  composition,
  price,
  priceSurPlace,
  image,
  isHomemade
}`

export interface SanityProduct {
  _id: string
  name: string
  category: string
  composition: string
  price: number
  priceSurPlace?: number
  image: {
    _type: 'image'
    asset: { _ref: string; _type: 'reference' }
    hotspot?: { x: number; y: number; width: number; height: number }
    crop?: { top: number; bottom: number; left: number; right: number }
  }
  isHomemade: boolean
}

export async function fetchAllProducts(): Promise<SanityProduct[]> {
  return client.fetch<SanityProduct[]>(ALL_PRODUCTS_QUERY)
}
