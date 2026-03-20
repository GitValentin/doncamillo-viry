#!/usr/bin/env node
/**
 * Migration script: data.json -> Sanity product documents
 *
 * Prerequisites:
 *   - .env.local with NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN
 *   - Images in ./public/img/ (paths from data.json like /img/margherita.webp)
 *
 * Run: node --env-file=.env.local scripts/migrate.mjs
 */

import { createClient } from '@sanity/client'
import { createReadStream } from 'fs'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error('Missing env vars. Ensure .env.local has:')
  console.error('  NEXT_PUBLIC_SANITY_PROJECT_ID')
  console.error('  NEXT_PUBLIC_SANITY_DATASET')
  console.error('  SANITY_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-20',
  token,
  useCdn: false,
})

/** JSON key -> product category value (from schema) */
const CATEGORY_MAP = {
  pizzas_base_tomates: 'base_tomate',
  pizzas_base_creme: 'base_creme',
  specialites: 'specialite',
  sandwichs: 'sandwich',
  desserts: 'dessert',
  salades: 'salade',
  boissons: 'boisson',
}

const PRODUCT_KEYS = Object.keys(CATEGORY_MAP)

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function uploadImage(imagePath) {
  const fullPath = join(ROOT, 'public', imagePath.replace(/^\//, ''))
  if (!existsSync(fullPath)) {
    console.warn(`  ⚠ Image not found: ${fullPath}`)
    return null
  }
  const stream = createReadStream(fullPath)
  const filename = imagePath.split('/').pop()
  const asset = await client.assets.upload('image', stream, { filename })
  return asset._id
}

async function migrate() {
  const dataPath = join(ROOT, 'src', 'data', 'data.json')
  const raw = readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw)

  const transaction = client.transaction()
  let count = 0

  for (const key of PRODUCT_KEYS) {
    const items = data[key]
    if (!Array.isArray(items)) continue

    const category = CATEGORY_MAP[key]
    console.log(`\n${key} (${category}): ${items.length} items`)

    for (const item of items) {
      const name = item.nom
      if (!name) {
        console.warn(`  ⚠ Skipping item with missing nom`)
        continue
      }

      const price = item.prix ?? item.prix_a_emporter
      const priceSurPlace = item.prix_sur_place

      if (price == null) {
        console.warn(`  ⚠ Skipping "${name}": no prix or prix_a_emporter`)
        continue
      }

      const imagePath = item.image_path
      if (!imagePath) {
        console.warn(`  ⚠ Skipping "${name}": no image_path`)
        continue
      }

      const assetId = await uploadImage(imagePath)
      if (!assetId) {
        console.warn(`  ⚠ Skipping "${name}": image upload failed`)
        continue
      }

      const docId = `product-${category}-${slugify(name)}`
      const doc = {
        _id: docId,
        _type: 'product',
        name,
        category,
        composition: item.composition ?? '',
        price: Number(price),
        ...(priceSurPlace != null && { priceSurPlace: Number(priceSurPlace) }),
        image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: assetId },
        },
        isHomemade: Boolean(item.fait_maison),
      }

      transaction.createOrReplace(doc)
      count++
      console.log(`  ✓ ${name}`)
    }
  }

  await transaction.commit()
  console.log(`\nDone. Created/updated ${count} products.`)
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
