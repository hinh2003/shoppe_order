# 📊 Shopee Order Statistics

A Chrome extension that helps you view your Shopee order statistics by year quickly and intuitively.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

## ✨ Features

- 📈 **Detailed Statistics**: View total spending, number of orders, and products purchased
- 💰 **Calculate Savings**: Know how much you've saved from discount programs
- 📅 **Any Year**: View statistics from year 2000 to 2025
- 🚀 **Fast**: Automatically fetch and calculate from Shopee API
- 🎨 **Beautiful Interface**: Modern design with official Shopee colors
- 🔒 **Secure**: No personal data is stored

## 📸 Screenshot
<img src="images/demo.jpg" alt="demo1" width="200"/>

<img src="images/demo.jpg" alt="demo2" width="200"/>


## 🚀 Installation

### From Chrome Web Store
[Install from Chrome Web Store](https://chromewebstore.google.com/detail/onbpbhaihdjpedddlimickkodibnpmdg?utm_source=item-share-cb)

### Manual Installation (Developer Mode)

1. Download or clone this repository:
```bash
git clone https://github.com/hinh2003/shoppe_order.git
```

2. Open Chrome and visit `chrome://extensions/`

3. Enable **Developer mode** (top right corner)

4. Click **Load unpacked** and select the folder containing the extension

5. Extension is ready to use! 🎉

## 📖 Usage Guide

1. **Log in to Shopee**: Open [shopee.vn](https://shopee.vn) and log in to your account

2. **Open Extension**: Click the Shopee Order Statistics icon on your Chrome toolbar

3. **Enter Year**: Enter the year you want to check statistics for

4. **Calculate**: Click the "Calculate Statistics" button and wait for completion

5. **View Results**: 
   - Total spending in the year
   - Total delivered orders
   - Total products purchased
   - Total money saved

## 📋 Requirements

- Google Chrome version 88 or higher
- Shopee account logged in
- Stable internet connection

## 🔐 Permissions

This extension requires the following permissions:

- `cookies`: To check Shopee login status
- `scripting`: Inject script to fetch order data
- `activeTab`: Interact with open Shopee tab
- `host_permissions`: Only works on shopee.vn domain

**Note**: The extension does not store or send your data to any server. All calculations are performed locally on your browser.

## 🐛 Report Issues

If you encounter any problems, please:

1. Check if you are logged into Shopee
2. Make sure you are on the shopee.vn page
3. Try reloading the page and extension
4. If still having issues, [create an issue](https://github.com/yourusername/shopee-order-statistics/issues) with details

## 🤝 Contributing

All contributions are welcome! 

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### Version 2.0 (2025)
- ✨ Converted to Side Panel
- 📊 Order statistics by year
- 💰 Calculate savings
- 🎨 Intuitive user interface

### Version 1.0.0 (2025)
- ✨ Initial release
- 📊 Order statistics by year
- 💰 Calculate money saved
- 🎨 Intuitive user interface

## 📄 License

This project is released under the MIT License - see the [LICENSE](LICENSE) file for more details.

## 👨‍💻 Author

- GitHub: [@hinh2003](https://github.com/hinh2003)

## ⭐ Support

If you find this extension useful, please give it a ⭐ on GitHub!

## ☕ Donate

If this extension has been helpful to you, buy me a coffee! ❤️

### Momo
<img src="images/qr-momo.jpg" alt="Momo QR" width="200"/>

**Or transfer directly:**
- 💳 Account number: `04242595201`
- 🏦 Bank: `TP Bank`
- 👤 Account holder: `NGUYEN VAN TUAN HINH`


Thank you very much! 🙏

## 📞 Contact

Have questions? [Create an issue](https://github.com/hinh2003/shoppe-order-statistics/issues) or contact directly via GitHub.

## 🔒 Privacy Policy

Shopee Order does not collect, store, or share any personal data from users.
The extension only accesses Shopee cookies locally to check login status and fetch order data directly from the Shopee website.
All data is processed entirely on your device — no information is transmitted to any external servers or third parties.

Permissions explanation:

- `cookies`: Used to verify Shopee login status
- `storage`: Used to store user settings (e.g., selected year)
- `scripting`: Used to inject code into Shopee pages to calculate order statistics
- `activeTab`: Used to interact with the active Shopee tab

Shopee Order does not include advertising, analytics, or tracking of any kind.
If you have any questions, please contact us via the Chrome Web Store developer contact page.

---

**Note**: This extension is not officially affiliated with Shopee. This is an independent project created to help users track their orders more easily.

