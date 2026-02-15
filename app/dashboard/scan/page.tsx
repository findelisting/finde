'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'

export default function ScanPage() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()

  useEffect(() => {
    fetchProduct(id)
  }, [id])

  const fetchProduct = async (productId: string) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      setProduct(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen text-center text-gray-400">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen text-center text-red-500 p-8">Error: {error}</div>
  }

  if (!product) {
    return <div className="min-h-screen text-center text-gray-400">Product not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
          <div className="flex items-center space-x-4">
            <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              <div className="mt-4">
                <p className="text-xs text-gray-500">Created: {new Date(product.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}