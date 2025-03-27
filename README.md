# TackleBot Website 🎣

A responsive and interactive website for TackleBot, a Discord fishing bot. This website showcases the bot's features, commands, and provides easy access for users to invite the bot to their servers.

## 🌟 Features

- **Interactive Design**: Fully responsive layout that works on all devices
- **Animated Sections**: Smooth fade-in animations as users scroll
- **Water Trail Cursor**: Custom water droplet cursor that leaves a trail and creates splashes when clicking
- **Ripple Effects**: Interactive button effects with satisfying feedback
- **Modern UI**: Clean, adorable aesthetic with gradient colors and playful elements

## 💧 Custom Water Effects

The website features custom water-themed cursor effects:

- Water droplet cursor follows mouse movements
- Small trail of water particles
- Splash animation when clicking
- Squish effect when pressing down

## 🛠️ Technologies Used

- HTML5
- CSS3 (with custom animations and responsive design)
- JavaScript (vanilla JS for interactivity)
- Google Fonts (Nunito)
- Font Awesome (for icons)
- IntersectionObserver API (for scroll animations)

## 📁 File Structure

- **index.html** - Main website structure and content
- **style.css** - All styling, animations, and responsive design rules
- **script.js** - Interactive elements, animations, and behavior

## 🚀 Getting Started

1. Clone this repository or download the files
2. Open `index.html` in your browser to view the website
3. To make changes:
   - Edit `index.html` for content changes
   - Modify `style.css` for styling and animation adjustments
   - Update `script.js` for behavior and interactivity changes

## ⚙️ Customization

### Discord Bot Links

In the `script.js` file, update the following variables with your actual Discord bot links:

```javascript
const discordInviteLink = "https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID";
const discordSupportLink = "https://discord.gg/YOUR_INVITE_CODE";
```

### Changing Content

- Update features, commands, and descriptions in the `index.html` file
- The website uses emojis extensively - modify them to match your bot's theme

## 📱 Responsive Design

The website is built with mobile-first responsiveness in mind, with breakpoints at:
- 992px (tablets and smaller desktops)
- 768px (tablets)
- 576px (mobile landscape)
- 400px (mobile portrait)

## 🧠 Performance Considerations

- Uses IntersectionObserver for efficient scroll animations
- Optimized animations with requestAnimationFrame
- Cleans up event listeners and DOM elements to prevent memory leaks

## 📄 License

Feel free to use and modify this website for your own Discord bot.

## 🤝 Credits

- Animations and effects inspired by modern web design principles
- Font Awesome for the Discord icon
- Google Fonts for the Nunito font family