# Apploye Pulse ⚡

A powerful Chrome extension that enhances your Apploye timesheet experience with real-time progress tracking, holiday management, and smart month-aware calculations.

![Apploye Pulse Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=Apploye+Pulse+-+Track+Your+Timesheet+Progress)

## ✨ Features

### 🎯 Real-Time Progress Tracking
- **Live Progress Badge**: See if you're ahead or behind your monthly goals at a glance
- **Smart Calculations**: Automatically calculates expected hours based on working days and holidays
- **Month-Aware**: Only shows progress for the current month to avoid confusion
- **Visual Indicators**: Green for ahead, red for behind, blue for on track

### 🎉 Holiday Management
- **Visual Holiday Markers**: Beautiful animated badges on holiday dates
- **Easy Management**: Add/remove holidays from the options page
- **Smart Integration**: Holidays are automatically excluded from progress calculations
- **Month-Specific**: Holiday markers work across all months

### ⚙️ Customizable Settings
- **Daily Hours**: Set your expected daily working hours (default: 8h)
- **Holiday Calendar**: Manage your personal holidays
- **Real-Time Updates**: Changes reflect immediately across all components

### 🎨 Modern UI
- **Clean Design**: Built with Tailwind CSS and shadcn/ui components
- **Responsive**: Works perfectly on all screen sizes
- **Smooth Animations**: Delightful micro-interactions
- **Dark/Light Mode**: Adapts to your system preferences

## 🚀 Installation

### From Chrome Web Store
*Coming soon...*

### Manual Installation (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/itsproali/apploye-pulse.git
   cd apploye-pulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `build/chrome-mv3-prod` folder

## 📖 Usage

### Getting Started
1. **Navigate to Apploye**: Go to [app.apploye.com](https://app.apploye.com) and log in
2. **Visit Timesheet**: Go to the monthly timesheet view
3. **See Progress**: The progress badge will appear next to "Total Hour" showing your status
4. **Manage Holidays**: Click the extension icon to access settings and holiday management

### Understanding the Progress Badge
- **🟢 +2h 30m ahead**: You're 2 hours and 30 minutes ahead of your expected progress
- **🔴 -1h 15m behind**: You're 1 hour and 15 minutes behind your expected progress
- **✓ On track**: You're within 30 minutes of your expected progress

### Managing Holidays
1. Click the Apploye Pulse extension icon
2. Click "Manage Holidays" or go to Options
3. Add holidays by clicking the date picker
4. Remove holidays by clicking the X on existing holiday badges
5. Changes are saved automatically

## 🛠️ Technical Details

### Built With
- **Plasmo Framework**: Modern Chrome extension development
- **React + TypeScript**: Type-safe component development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful UI components
- **Chrome Storage API**: Persistent data storage

### Architecture
- **Content Scripts**: Inject progress badges and holiday markers
- **Options Page**: Settings and holiday management
- **Popup**: Quick overview and navigation
- **Background Script**: Handles storage and messaging

### Browser Support
- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## 📝 Privacy & Security

- **No Data Collection**: All data is stored locally in your browser
- **No External Requests**: No data is sent to external servers
- **Open Source**: Full source code is available for review
- **Minimal Permissions**: Only requests access to Apploye.com and storage

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Apploye](https://apploye.com) for the amazing timesheet platform
- [Plasmo](https://www.plasmo.com) for the excellent extension framework
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/itsproali/apploye-pulse/issues)
- **Email**: itsproali@gmail.com
- **Discussions**: [GitHub Discussions](https://github.com/itsproali/apploye-pulse/discussions)

## 🗺️ Roadmap

- [ ] Chrome Web Store publication
- [ ] Firefox extension support
- [ ] Weekly progress reports
- [ ] Team collaboration features
- [ ] Mobile app companion
- [ ] Advanced analytics dashboard

---

Made with ❤️ by [Mohammad Ali](https://github.com/itsproali)

**Star this repo if you find it helpful! ⭐**