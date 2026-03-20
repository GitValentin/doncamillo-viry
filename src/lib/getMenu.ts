import { fetchAllProducts, type SanityProduct } from './sanity.queries'
import type { MenuItem, FlipbookPage, EstablishmentInfo } from './types'

const CATEGORY_SECTIONS: {
  category: string
  key: string
  title: string
}[] = [
  { category: 'base_tomate', key: 'pizzas_base_tomates', title: 'Pizzas base tomates' },
  { category: 'base_creme', key: 'pizzas_base_creme', title: 'Pizzas base crème' },
  { category: 'specialite', key: 'specialites', title: 'Spécialités' },
  { category: 'sandwich', key: 'sandwichs', title: 'Sandwichs' },
  { category: 'dessert', key: 'desserts', title: 'Desserts' },
  { category: 'salade', key: 'salades', title: 'Salades' },
  { category: 'boisson', key: 'boissons', title: 'Boissons' },
]

const ESTABLISHMENT_INFO: EstablishmentInfo = {
  nom: 'Don Camillos Pizza',
  adresse: 'Avenue Marmont, Parking My Auchan, 91170 Viry-Châtillon',
  telephone: '06.35.80.69.68',
  horaires: '7/7j, 12:00 à 14:30 et 18:00 à 22:30',
  specificites: 'Sur place, à emporter ou livraisons',
}

function toMenuItem(product: SanityProduct): MenuItem {
  const hasDualPricing = product.priceSurPlace != null
  return {
    nom: product.name,
    composition: product.composition,
    prix: hasDualPricing ? undefined : product.price,
    prix_a_emporter: hasDualPricing ? product.price : undefined,
    prix_sur_place: hasDualPricing ? product.priceSurPlace : undefined,
    image: product.image,
    fait_maison: product.isHomemade ?? false,
  }
}

function groupByCategory(products: SanityProduct[]): Record<string, MenuItem[]> {
  const grouped: Record<string, MenuItem[]> = {}
  for (const section of CATEGORY_SECTIONS) {
    grouped[section.key] = []
  }
  for (const product of products) {
    const section = CATEGORY_SECTIONS.find((s) => s.category === product.category)
    if (section) {
      grouped[section.key].push(toMenuItem(product))
    }
  }
  return grouped
}

export async function getFlipbookPages(): Promise<FlipbookPage[]> {
  const products = await fetchAllProducts()
  const grouped = groupByCategory(products)
  const pages: FlipbookPage[] = []

  pages.push({ type: 'cover', info: ESTABLISHMENT_INFO })

  for (const section of CATEGORY_SECTIONS) {
    const items = grouped[section.key]
    if (!items || items.length === 0) continue

    pages.push({ type: 'section', title: section.title })

    for (const item of items) {
      pages.push({ type: 'item', item })
    }
  }

  return pages
}
