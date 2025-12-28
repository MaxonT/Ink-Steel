# Deployment Guide

## Pre-Deployment Checklist

- [ ] All data files are up to date
- [ ] All images load correctly
- [ ] All purchase links are valid
- [ ] Tested in multiple browsers
- [ ] No console errors
- [ ] SEO meta tags are complete
- [ ] robots.txt is configured
- [ ] sitemap.xml is updated
- [ ] Service Worker is working
- [ ] PWA manifest is correct

## Deployment Steps

### Option 1: Netlify (Recommended for simplicity)

1. Go to [Netlify](https://www.netlify.com)
2. Sign up or log in
3. Click "Add new site" > "Deploy manually"
4. Drag and drop the `frontend` folder
5. Wait for deployment
6. Configure custom domain (optional)

### Option 2: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Follow the prompts

### Option 3: GitHub Pages

1. Push code to GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Select folder: `/frontend`
5. Save and wait for deployment

### Option 4: AWS S3 + CloudFront

1. Create S3 bucket
2. Upload `frontend` folder contents
3. Configure bucket for static website hosting
4. Create CloudFront distribution (optional, for CDN)
5. Set up custom domain (optional)

### Option 5: Traditional Web Server

1. Upload `frontend` folder contents to your web server
2. Ensure `.htaccess` (Apache) or `nginx.conf` (Nginx) is configured correctly
3. Set proper MIME types for JSON files
4. Configure HTTPS

## Post-Deployment

### Verify Deployment

1. Check homepage loads correctly
2. Test search functionality
3. Test pen detail pages
4. Verify images load
5. Check purchase links work
6. Test on mobile devices
7. Check Service Worker registration
8. Verify PWA installation works

### Performance Check

1. Run PageSpeed Insights
2. Check Core Web Vitals
3. Verify image optimization
4. Check caching headers

### SEO Check

1. Verify meta tags in page source
2. Check structured data with Google Rich Results Test
3. Submit sitemap to Google Search Console
4. Verify robots.txt is accessible

## Monitoring

### Recommended Tools

- **Google Analytics**: Track user behavior
- **Google Search Console**: Monitor SEO performance
- **Uptime Monitoring**: Services like UptimeRobot
- **Error Tracking**: Consider Sentry for error tracking

## Updates

To update the deployed site:

1. Make changes locally
2. Test thoroughly
3. Deploy using the same method as initial deployment
4. Verify updates work correctly

## Rollback

If issues occur:

1. **Netlify/Vercel**: Use deployment history to rollback
2. **GitHub Pages**: Revert to previous commit
3. **S3**: Upload previous version
4. **Traditional**: Restore from backup

## HTTPS

Ensure HTTPS is enabled:

- **Netlify/Vercel**: Automatic SSL certificates
- **GitHub Pages**: Automatic HTTPS
- **CloudFront**: Use AWS Certificate Manager
- **Traditional**: Install SSL certificate (Let's Encrypt recommended)

## Custom Domain

1. Configure DNS records (CNAME or A record)
2. Update domain in hosting provider
3. Wait for DNS propagation (up to 48 hours)
4. Verify SSL certificate is issued

## Backup Strategy

1. Regular backups of data files
2. Version control (Git)
3. Keep deployment history
4. Backup user data (favorites, history) if stored

