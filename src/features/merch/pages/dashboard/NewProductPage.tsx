import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { useCreateProduct, type NewVariantInput } from '../../hooks/useCreateProduct'
import { Button, Input } from '@/components/ui'
import { toast } from '@/components/ui/toastStore'
import type { Product } from '@/types'

interface VariantRow {
  size: string
  priceEuros: string
  stockQuantity: string
}

function emptyVariant(): VariantRow {
  return { size: '', priceEuros: '', stockQuantity: '25' }
}

export default function NewProductPage() {
  const { artistId } = useParams()
  const uid = useAuthStore((s) => s.firebaseUser?.uid)
  const navigate = useNavigate()
  const { createProduct, saving } = useCreateProduct(artistId ?? '', uid)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Product['category']>('apparel')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()])

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function removeVariant(index: number) {
    setVariants((rows) => rows.filter((_, i) => i !== index))
  }

  const validVariants = variants
    .map((row): NewVariantInput | null => {
      const priceCents = Math.round(Number.parseFloat(row.priceEuros.replace(',', '.')) * 100)
      const stockQuantity = Number.parseInt(row.stockQuantity, 10)
      if (!Number.isFinite(priceCents) || priceCents <= 0 || !Number.isFinite(stockQuantity)) return null
      return {
        label: row.size.trim() || 'Taille unique',
        size: row.size.trim() || null,
        priceCents,
        stockQuantity,
      }
    })
    .filter((v): v is NewVariantInput => v !== null)

  const canSubmit = title.trim().length > 0 && imageFiles.length > 0 && validVariants.length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await createProduct({
        title: title.trim(),
        description: description.trim(),
        category,
        imageFiles,
        variants: validVariants,
      })
      toast('Produit ajouté.', 'success')
      navigate('..')
    } catch {
      toast("Échec de l'ajout du produit. Vérifie que Storage est bien activé.", 'error')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-xl font-semibold">Nouveau produit</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-black/70">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-md border border-black/20 bg-black/5 px-3.5 py-2.5 text-sm text-noir"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-black/70">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Product['category'])}
            className="h-11 rounded-md border border-black/20 bg-black/5 px-3.5 text-sm text-noir"
          >
            <option value="apparel">Vêtements</option>
            <option value="accessories">Accessoires</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-black/70">Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-black/70">Tailles / variantes</label>
          {variants.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <Input
                label={i === 0 ? 'Taille' : undefined}
                placeholder="M, Unique…"
                value={row.size}
                onChange={(e) => updateVariant(i, { size: e.target.value })}
              />
              <Input
                label={i === 0 ? 'Prix (€)' : undefined}
                placeholder="29.00"
                inputMode="decimal"
                value={row.priceEuros}
                onChange={(e) => updateVariant(i, { priceEuros: e.target.value })}
              />
              <Input
                label={i === 0 ? 'Stock' : undefined}
                type="number"
                min={0}
                value={row.stockQuantity}
                onChange={(e) => updateVariant(i, { stockQuantity: e.target.value })}
              />
              {variants.length > 1 && (
                <Button type="button" variant="ghost" size="md" onClick={() => removeVariant(i)}>
                  ✕
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setVariants((r) => [...r, emptyVariant()])}>
            + Ajouter une taille
          </Button>
        </div>

        <Button type="submit" loading={saving} disabled={!canSubmit}>
          Publier le produit
        </Button>
      </form>
    </div>
  )
}
