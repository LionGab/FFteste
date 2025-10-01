# 🚀 QUICK START GUIDE - FULLFORCE ACADEMIA WEBSITE

## Get Started in 3 Easy Steps!

### Step 1: View the Website Locally

#### Option A: Direct Browser Opening (Simplest)
```bash
cd fullforce-site
# Then open index.html in your browser
```

#### Option B: Using Python (Recommended for Development)
```bash
cd fullforce-site
python3 -m http.server 8080
# Visit: http://localhost:8080
```

#### Option C: Using Node.js
```bash
# Install http-server (one time)
npm install -g http-server

# Run the server
cd fullforce-site
http-server -p 8080 -o
```

### Step 2: Explore the Pages

- **Home**: http://localhost:8080/index.html
- **About**: http://localhost:8080/pages/about.html
- **Services**: http://localhost:8080/pages/services.html
- **Schedule**: http://localhost:8080/pages/schedule.html
- **Contact**: http://localhost:8080/pages/contact.html

### Step 3: Customize the Content

#### Update Colors
Edit `fullforce-site/css/style.css`:
```css
:root {
    --primary-color: #ff6b00;    /* Change to your color */
    --secondary-color: #1a1a1a;  /* Change to your color */
}
```

#### Update Text Content
Edit any `.html` file in your favorite text editor:
- `fullforce-site/index.html` - Home page
- `fullforce-site/pages/about.html` - About page
- etc.

#### Add Images
Place your images in:
- `fullforce-site/images/logo/` - Logo files
- `fullforce-site/images/hero/` - Hero section images
- `fullforce-site/images/services/` - Service images
- `fullforce-site/images/team/` - Team photos

Then reference them in HTML:
```html
<img src="images/logo/logo.png" alt="FullForce Academia">
```

---

## 📱 Mobile Testing

Test on different screen sizes:

### Using Browser DevTools
1. Open the website in Chrome/Firefox
2. Press F12 to open DevTools
3. Click the device toggle button (Ctrl+Shift+M)
4. Select different device sizes

### Using Real Devices
Share your local server using tools like:
- ngrok: `ngrok http 8080`
- localtunnel: `lt --port 8080`

---

## 🎯 Common Customizations

### 1. Change Contact Information
Edit all `.html` files, search for:
- Phone: `(11) 1234-5678`
- Email: `contato@fullforceacademia.com.br`
- Address: `Rua Exemplo, 123`

### 2. Update Schedule
Edit `fullforce-site/pages/schedule.html`:
- Find the `<table>` elements
- Update times, classes, and instructors

### 3. Modify Services
Edit `fullforce-site/pages/services.html`:
- Update service descriptions
- Add/remove service cards
- Change icons (emojis)

### 4. Add Google Maps
Edit `fullforce-site/pages/contact.html`:
- Find the map placeholder section
- Replace with Google Maps embed code

---

## 🔧 Troubleshooting

### Issue: CSS not loading
**Solution**: Check file paths in HTML:
```html
<link rel="stylesheet" href="css/style.css">
```

### Issue: Links not working
**Solution**: Verify relative paths:
- From index.html: `pages/about.html`
- From about.html: `../index.html`

### Issue: JavaScript not working
**Solution**: Check browser console (F12) for errors

---

## 📦 Deployment

### GitHub Pages (Free)
1. Push code to GitHub
2. Go to Settings > Pages
3. Select branch and folder
4. Save and wait for deployment

### Netlify (Free)
1. Sign up at netlify.com
2. Drag and drop `fullforce-site` folder
3. Site goes live instantly

### Vercel (Free)
1. Install vercel: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

---

## 📚 Resources

### Documentation
- `README.md` - Complete guide
- `TECHNICAL_AUDIT.md` - Technical details
- `IMPLEMENTATION_SUMMARY.md` - Project summary

### Learning
- [MDN Web Docs](https://developer.mozilla.org) - HTML/CSS/JS reference
- [CSS-Tricks](https://css-tricks.com) - CSS tips and tricks
- [JavaScript.info](https://javascript.info) - Modern JavaScript

---

## ✅ Checklist Before Going Live

- [ ] Replace all placeholder images
- [ ] Update contact information
- [ ] Test all forms
- [ ] Check all links
- [ ] Test on mobile devices
- [ ] Add Google Analytics
- [ ] Add favicon
- [ ] Test loading speed
- [ ] Spell check all content
- [ ] SEO optimization

---

## 💡 Tips

1. **Always test locally** before deploying
2. **Backup your changes** regularly
3. **Use version control** (Git)
4. **Test on multiple browsers**
5. **Optimize images** before adding
6. **Keep code organized** and commented
7. **Regular updates** keep site fresh

---

## 🆘 Need Help?

Check these resources:
1. Project documentation in this repository
2. GitHub Issues for this project
3. Web development forums (Stack Overflow)
4. MDN Web Docs for technical questions

---

**Happy building! 💪**

---

*Last updated: October 2025*
