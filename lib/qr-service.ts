import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase/client'

export async function generateQRCode(businessId: string, productId: string) {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/scan/${businessId}/${productId}`,
      {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 512
      }
    )

    // Convert data URL to buffer
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(
        `qr-codes/${businessId}-${productId}.png`,
        buffer,
        {
          contentType: 'image/png',
          upsert: true
        }
      )

    if (error) {
      throw new Error(`Failed to upload QR code: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(`qr-codes/${businessId}-${productId}.png`)

    // Update product with QR code URL
    await supabase
      .from('products')
      .update({ qr_code_url: publicUrl })
      .eq('id', productId)

    return publicUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

export async function getQRCode(businessId: string, productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('qr_code_url')
    .eq('business_id', businessId)
    .eq('id', productId)

  if (error) {
    throw new Error(`Failed to get QR code: ${error.message}`)
  }

  return data?.[0]?.qr_code_url
}

export async function trackQRScan(businessId: string, productId: string) {
  try {
    // Get current analytics record
    const { data: analytics } = await supabase
      .from('analytics')
      .select('id, scan_count')
      .eq('business_id', businessId)
      .eq('product_id', productId)
      .single()

    if (analytics) {
      // Update existing record
      await supabase
        .from('analytics')
        .update({
          scan_count: analytics.scan_count + 1,
          last_scan_at: new Date().toISOString()
        })
        .eq('id', analytics.id)
    } else {
      // Create new record
      await supabase
        .from('analytics')
        .insert({
          business_id: businessId,
          product_id: productId,
          scan_count: 1,
          last_scan_at: new Date().toISOString()
        })
    }

    // Log scan (optional - for detailed tracking)
    try {
      await supabase
        .from('qr_scans')
        .insert({
          business_id: businessId,
          product_id: productId,
          scanned_at: new Date().toISOString()
        })
    } catch (insertError) {
      // Table might not exist yet, ignore
      console.log('QR scans table not ready')
    }

  } catch (error) {
    console.error('Error tracking QR scan:', error)
  }
}