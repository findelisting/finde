'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { trackQRScan } from '@/lib/qr-service'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  qr_code_url: string | null
  created_at: string
  business_id: string
}

export default function ScanPage() {
  const params = useParams()
  const productId = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (productId) {
      fetchProduct(productId)
      trackScan(productId)
    }
  }, [productId])

  const fetchProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setProduct(data)
      }
    } catch (err) {
      setError('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const trackScan = async (id: string) => {
    try {
      // Get product to find business_id
      const { data } = await supabase
        .from('products')
        .select('business_id')
        .eq('id', id)
        .single()

      if (data) {
        await trackQRScan(data.business_id, id)
      }
    } catch (err) {
      console.error('Failed to track scan:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-teal-100">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">{error || 'The product you are looking for does not exist.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-teal-100">
          <div className="md:flex">
            <div className="md:w-1/2 relative h-64 md:h-auto">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full">
                  Product
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    <p>Product ID</p>
                    <p className="font-mono text-xs mt-1">{product.id}</p>
                  </div>
                  <div className="text-right">
                    <p>Added</p>
                    <p className="mt-1">{new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* XR Gateway Placeholder */}
              <div className="mt-8 border-2 border-dashed border-teal-300 rounded-xl p-6 text-center bg-teal-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">View in AR/VR</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Experience this product in 3D. Scan the QR code with your mobile device.
                </p>
                <button className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition">
                  Launch AR Viewer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Agent Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Our AI support agent can answer questions about this product using the digital manual.
          </p>
          <button className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition">
            Chat with Support
          </button>
        </div>
      </div>
    </div>
  )
}