import { useState } from 'react'
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { artistProductPath, uploadArtistFile } from '@/lib/firebase/upload'
import type { Product } from '@/types'

export interface NewVariantInput {
  label: string
  size: string | null
  priceCents: number
  stockQuantity: number
}

export function useCreateProduct(artistId: string, userId: string | undefined) {
  const [saving, setSaving] = useState(false)

  async function createProduct(input: {
    title: string
    description: string
    category: Product['category']
    imageFiles: File[]
    variants: NewVariantInput[]
  }) {
    if (!userId) throw new Error('not_signed_in')
    if (input.variants.length === 0) throw new Error('no_variants')
    setSaving(true)
    try {
      const productRef = doc(collection(db, 'products'))
      const images = await Promise.all(
        input.imageFiles.map((file, i) => uploadArtistFile(artistProductPath(artistId, productRef.id, i, file), file)),
      )
      const minPriceCents = Math.min(...input.variants.map((v) => v.priceCents))

      await setDoc(productRef, {
        artistId,
        title: input.title,
        description: input.description,
        category: input.category,
        images,
        minPriceCents,
        currency: 'EUR',
        status: 'active',
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await Promise.all(
        input.variants.map((variant, i) => {
          const variantId = variant.size ? variant.size.toLowerCase() : `default-${i}`
          return setDoc(doc(db, 'products', productRef.id, 'variants', variantId), {
            productId: productRef.id,
            label: variant.label,
            size: variant.size,
            color: null,
            priceCents: variant.priceCents,
            stockQuantity: variant.stockQuantity,
            sku: `${productRef.id}-${variantId}`.toUpperCase(),
          })
        }),
      )

      return productRef.id
    } finally {
      setSaving(false)
    }
  }

  return { createProduct, saving }
}
