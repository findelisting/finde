# Finde MVP Deployment Guide

## 1. Prerequisites
- [ ] Git repository initialized
- [ ] Vercel account created
- [ ] Supabase project configured with:
  - PostgreSQL schema (`supabase/schema.sql`)
  - Storage bucket `product-images` (public)
  - Environment variables set

## 2. Deployment Steps
### 2.1 Deploy to Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel --prod`

### 2.2 Configure Supabase
1. Create storage bucket `product-images` in Supabase Dashboard
2. Push schema: `supabase db push`

### 2.3 Update QR Service
Edit `finde/lib/qr-service.ts` to use production Supabase URL:
```typescript
const qrCodeDataUrl = await create(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/scan/${businessId}/${productId}`,
  { type: 'image/png', quality: 0.9 }
);
```

## 3. Testing
1. Visit deployed URL
2. Test product upload
3. Verify QR code generation
4. Test scan functionality

## 4. Optional Enhancements
- [ ] Add custom domain
- [ ] Implement RLS policies
- [ ] Set up error tracking

## 5. Final Checklist
- [ ] Push code to Git
- [ ] Set environment variables in Vercel
- [ ] Apply schema to Supabase
- [ ] Deploy to Vercel
