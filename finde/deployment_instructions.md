# Finde MVP Deployment Guide (PowerShell Edition)

## 1. Fix Git Initialization Error
If you encounter `fatal: adding files failed`, follow these steps:

1. **Remove corrupted .git folder**:
```powershell
Remove-Item -Recurse .git
```

2. **Re-initialize Git**:
```powershell
cd finde
git init
```

3. **Add and commit files**:
```powershell
cd finde
```
```powershell
git add .
git commit -m "Initial commit - Finde MVP"
```

## 2. Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name: `finde`
4. Description: "Finde MVP - African Business Digitization Platform"
5. Choose Public/Private
6. **DO NOT** check "Initialize with README"
7. Click "Create repository"

## 3. Link Local to GitHub
In terminal:
```powershell
cd finde
```
```powershell
git remote add origin https://github.com/YOUR_USERNAME/finde.git
```
```powershell
git branch -M main
```
```powershell
git push -u origin main
```

## 4. Deploy to Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel --prod`

## 5. Configure Supabase
1. Create storage bucket `product-images` in Supabase Dashboard
2. Push schema: `supabase db push`

## 6. Final Checklist
- [ ] Fix Git errors
- [ ] Push to GitHub
- [ ] Deploy to Vercel
