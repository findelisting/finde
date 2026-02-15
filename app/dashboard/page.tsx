'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { generateQRCode } from '@/lib/qr-service'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  qr_code_url: string | null
  created_at: string
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)

  useEffect(() => {
    getBusinessAndProducts()
  }, [])

  const getBusinessAndProducts = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get business for user
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (business) {
        setBusinessId(business.id)
        await fetchProducts(business.id)
      }
    } catch (error) {
      console.error('Error fetching business:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async (bizId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false })
    setProducts(data || [])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !businessId) return

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${businessId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      // Create product record
      const { data: product } = await supabase
        .from('products')
        .insert({
          business_id: businessId,
          name: file.name.split('.')[0],
          description: 'Product description',
          image_url: publicUrl,
          product_type: 'physical'
        })
        .select()
        .single()

      // Generate QR code
      if (product) {
        await generateQRCode(businessId, product.id)
        await fetchProducts(businessId)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload product')
    } finally {
      setUploading(false)
    }
  }

  const generateQR = async (productId: string) => {
    if (!businessId) return
    try {
      await generateQRCode(businessId, productId)
      await fetchProducts(businessId)
    } catch (error) {
      console.error('Error generating QR:', error)
      alert('Failed to generate QR code')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-teal-800">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Finde Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition">
                Analytics
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Product</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-teal-300 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition group">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-teal-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600 group-hover:text-teal-600">
                  {uploading ? 'Uploading...' : 'Click to upload product image'}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.3d"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            <div className="text-sm text-gray-500">
              <p>Supported formats: JPG, PNG, PDF, 3D models</p>
              <p className="text-xs text-gray-400 mt-1">Optimized for low-bandwidth connections</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
          <p className="text-gray-600 text-sm mt-1">{products.length} products</p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-teal-100">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600">Upload your first product to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-teal-100 hover:shadow-xl transition">
                <div className="relative h-48 bg-gray-100">
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
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {product.qr_code_url ? (
                        <div className="relative w-16 h-16 border border-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={product.qr_code_url}
                            alt="QR Code"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">No QR</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => generateQR(product.id)}
                      disabled={!!product.qr_code_url}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        product.qr_code_url
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      {product.qr_code_url ? 'QR Ready' : 'Generate QR'}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}