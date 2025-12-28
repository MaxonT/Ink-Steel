# Ink & Steel

A curated gallery of fountain pens and inks, showcasing detailed specifications, high-quality images, and purchase information.

## Features

- **Comprehensive Database**: Browse hundreds of fountain pens and inks
- **Detailed Specifications**: Complete technical details for each product
- **Visual Gallery**: High-quality images and swatches
- **Search & Filter**: Find products by brand, type, price, and more
- **Comparison Tool**: Compare multiple pens side-by-side
- **Favorites**: Save your favorite products
- **Purchase Links**: Direct links to retailers
- **Responsive Design**: Works on desktop, tablet, and mobile
- **PWA Support**: Install as a web app

## Project Structure

```
Ink&Steel/
├── frontend/          # Frontend application
│   ├── assets/        # Styles, scripts, images
│   ├── data/          # JSON data files
│   ├── public/        # Public files (manifest, robots.txt, etc.)
│   └── *.html         # HTML pages
├── backend/           # Backend (reserved for future use)
└── others/            # Additional resources
    ├── config/        # Configuration files
    ├── data/          # Data processing files
    ├── docs/          # Documentation
    └── scripts/       # Utility scripts
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Ink&Steel
```

2. Start a local web server:

Using Python:
```bash
cd frontend
python3 -m http.server 8000
```

Using Node.js (http-server):
```bash
npm install -g http-server
cd frontend
http-server -p 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## Development

### Adding New Data

1. Edit `frontend/data/pens.json` or `frontend/data/inks.json`
2. Follow the existing data structure
3. Use the data validation tools in `others/scripts/` to ensure quality

### Data Processing Scripts

Located in `others/scripts/`:

- `image-fetcher.js` - Fetch images for products
- `fix-purchase-links.js` - Fix and add purchase links
- `supply-core-fields.js` - Ensure core data fields are complete
- `data-review.js` - Generate data quality reports
- `batch-import.js` - Import data from external sources

Run scripts with Node.js:
```bash
cd others/scripts
node <script-name>.js
```

## Deployment

### Static Hosting

This is a static website that can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `frontend` folder
- **Vercel**: Connect your repository
- **GitHub Pages**: Enable Pages in repository settings
- **AWS S3 + CloudFront**: Upload to S3 bucket
- **Any web server**: Upload `frontend` folder contents

### Build Steps

No build process required - files are ready to deploy as-is.

1. Ensure all data files are up to date
2. Verify all links work correctly
3. Test in multiple browsers
4. Upload `frontend` folder contents to your hosting service

### Environment Setup

No environment variables required for basic deployment.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Data Format

### Pen Data Structure

```json
{
  "id": "unique-id",
  "slug": "url-slug",
  "brand": "Brand Name",
  "model": "Model Name",
  "name": "Full Product Name",
  "type": "Fountain Pen",
  "description": "Short description",
  "details": "Detailed description",
  "specifications": { ... },
  "images": {
    "main": "image-url",
    "gallery": ["url1", "url2"]
  },
  "purchaseLinks": [
    {
      "name": "Retailer Name",
      "url": "product-url",
      "price": 100,
      "currency": "USD",
      "region": "US",
      "availability": "In Stock"
    }
  ],
  "tags": ["tag1", "tag2"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Credits

- Font: Cormorant Garamond (Google Fonts)
- Icons: [Add icon credits if applicable]

## Support

For issues or questions, please open an issue on GitHub.

