-- Finde Database Schema

-- Businesses Table
CREATE TABLE businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'NGN',
    images TEXT[], -- Array of image URLs
    videos TEXT[], -- Array of video URLs
    pdf_manuals TEXT[], -- Array of PDF manual URLs
    model_3d_url TEXT, -- 3D model URL for XR
    qr_code_url TEXT, -- Generated QR code URL
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Table
CREATE TABLE analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    scan_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    interaction_count INTEGER DEFAULT 0,
    last_scan_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Codes Table (for tracking)
CREATE TABLE qr_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    code_hash TEXT UNIQUE NOT NULL,
    scan_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Storage buckets for files
CREATE STORAGE AUTHORIZATION ROLE authenticated;
CREATE STORAGE AUTHORIZATION ROLE anon;

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('business-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
       ('product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
       ('product-videos', true, 52428800, ARRAY['video/mp4', 'video/webm']),
       ('product-manuals', true, 10485760, ARRAY['application/pdf']),
       ('3d-models', true, 20971520, ARRAY['model/gltf-binary', 'model/gltf+json']);

-- Set up storage policies
CREATE POLICY "Public access to all buckets" ON storage.objects
FOR SELECT USING (bucket_id IN ('business-logos', 'product-images', 'product-videos', 'product-manuals', '3d-models'));

CREATE POLICY "Authenticated users can insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('business-logos', 'product-images', 'product-videos', 'product-manuals', '3d-models'));

CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id IN ('business-logos', 'product-images', 'product-videos', 'product-manuals', '3d-models'));

CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id IN ('business-logos', 'product-images', 'product-videos', 'product-manuals', '3d-models'));

-- Enable RLS (Row Level Security)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Businesses are viewable by everyone" ON businesses
FOR SELECT USING (true);

CREATE POLICY "Businesses can be created by authenticated users" ON businesses
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Business owners can update their businesses" ON businesses
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Products are viewable by everyone" ON products
FOR SELECT USING (true);

CREATE POLICY "Products can be created by authenticated users" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Product owners can update their products" ON products
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Analytics are viewable by business owners" ON analytics
FOR SELECT USING (auth.uid() = business_id);

CREATE POLICY "QR codes are viewable by everyone" ON qr_codes
FOR SELECT USING (true);

CREATE POLICY "QR codes can be created by authenticated users" ON qr_codes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');