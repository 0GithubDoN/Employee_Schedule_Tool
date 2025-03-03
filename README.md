# Employee Rota Management System

A modern, web-based employee scheduling and rota management system that allows for easy creation, management, and export of employee schedules. The system requires no registration or personal data collection, ensuring privacy and a straightforward user experience.

## 🌟 Features

- **Interactive Schedule Management**: Create and modify employee schedules with an intuitive interface
- **Privacy-Focused**:
  - No registration required
  - No personal data collection or storage
  - All processing done client-side
- **Automatic Hour Calculation**:
  - Automatic calculation of total working hours
  - Support for split shifts (e.g., 12:00-16:30/17:00-20:00)
  - Break time handling
  - Daily and weekly hour totals
- **Import/Export Functionality**:
  - Import data from Excel (.xlsx) files with smart column mapping
  - Export schedules as PDF or Image
  - Convert PDF schedules to Excel format
- **Advanced Schedule Management**:
  - Combine rows for employees with split shifts
  - Real-time search and filtering
  - Drag-and-drop row rearrangement
  - Repeat shift patterns
- **Customization Options**:
  - Multiple theme options (Elegant, Rainbow, Colorful, Futuristic, AI, Google Calendar, Modern)
  - Customizable fonts
  - Responsive design for all devices
- **Data Management**:
  - Add/Remove employees
  - Save changes to local storage
  - Clear data with confirmation
  - Drag and drop functionality
  - Resizable elements

## 🚀 Getting Started

### Prerequisites

- Web server with PHP support
- Modern web browser
- Internet connection (for CDN resources)

### Installation

1. Clone or download this repository to your web server directory
2. Ensure your web server has PHP enabled
3. Make sure the `php/`, `js/`, `css/`, and `images/` directories have appropriate permissions
4. Access the application through your web browser

## 📁 Project Structure

```
Employee Rota/
├── css/
│   ├── style.css
│   ├── print.css
│   └── themes.css
├── js/
│   ├── script.js
│   ├── draggable.js
│   ├── resizable.js
│   └── print.js
├── php/
│   ├── schedule.php
│   ├── fonts.php
│   └── documentation.html
├── images/
│   ├── logo.png
│   └── favicon.ico
└── index.php
```

## 💻 Usage

1. **Importing Data**:
   - Click "Import Data from Excel" to upload an Excel file
   - Use the mapper popup to assign correct data positions
   - Double-check all entries post-import for accuracy
   - Supports only .xlsx format files

2. **Managing Schedules**:
   - Add employees using the "Add Employee" button
   - Combine rows for split shifts using the 'Combine' icon
   - Drag and drop to rearrange schedules
   - Use the search function to find specific employees
   - Auto-calculation of hours for regular shifts (e.g., 12:00-17:00) and split shifts (e.g., 12:00-17:00/19:00-22:00)

3. **Customization**:
   - Select different themes from the dropdown menu
   - Choose custom fonts using the font selector
   - Resize elements as needed

4. **Saving and Data Management**:
   - Changes are automatically saved to local storage
   - Use "Save Changes" button for manual saves
   - Clear all data with the "Clear Data" button (requires confirmation)

5. **Exporting**:
   - Export as PDF or Image
   - Print directly using the print button
   - Convert PDF schedules to Excel format

## ⚠️ Important Notes

- This is a BETA version - please verify all data before exporting
- Regular saving is recommended to prevent data loss
- For optimal performance, use modern browsers
- Deleted entries cannot be recovered - confirm before deleting
- All data is stored locally in your browser - no server storage

## 🔒 Privacy & Security

- No registration or login required
- No personal data collection or tracking
- All data processing happens client-side
- No data is sent to external servers
- Regular data backups are recommended

## 📝 Documentation

Detailed documentation is available through the "Go to Documentation" button in the application.

## 👨‍💻 Author

George Lucian

## 📄 License

Copyright © George Lucian. All rights reserved.

## 🤝 Support

For support or bug reports, please refer to the documentation or contact the system administrator. 