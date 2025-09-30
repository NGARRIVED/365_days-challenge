# Day 7 - Expense Tracker 💰

A comprehensive personal expense tracking application with data visualization and analytics.

## 📋 Project Overview

The Expense Tracker is a web-based application that helps users manage their personal finances by tracking income and expenses, categorizing transactions, and providing visual insights through charts and analytics.

## ✨ Features

### 🔧 Core Features
- **Add Expenses & Income** - Quick transaction entry with categories
- **Transaction History** - View all transactions with filtering options
- **Categories Management** - Predefined and custom expense categories
- **Balance Tracking** - Real-time balance calculation
- **Local Storage** - Data persistence without requiring a database

### 📊 Data Visualization
- **Expense Distribution** - Pie chart showing spending by category
- **Monthly Trends** - Line chart showing expense patterns over time
- **Category Analysis** - Bar chart comparing category spending
- **Budget vs Actual** - Progress bars showing budget utilization

### 🎯 Advanced Features
- **Budget Setting** - Set monthly budgets for different categories
- **Expense Filtering** - Filter by date range, category, or amount
- **Transaction Search** - Find specific transactions quickly
- **Export Data** - Download transaction history as CSV
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - Core functionality and DOM manipulation
- **Chart.js** - Data visualization and charts
- **Font Awesome** - Icons and visual elements

### Data Storage
- **LocalStorage** - Client-side data persistence
- **JSON** - Data serialization format

### Libraries & CDNs
- Chart.js 4.x - For creating responsive charts
- Font Awesome 6.x - For icons
- Date-fns (optional) - For date manipulation

## 📁 Project Structure

```
Day7/
├── index.html          # Main application page
├── styles/
│   ├── main.css        # Main application styles
│   ├── components.css  # Component-specific styles
│   └── themes.css      # Theme definitions
├── scripts/
│   ├── app.js          # Main application logic
│   ├── storage.js      # LocalStorage management
│   ├── charts.js       # Chart.js integration
│   └── utils.js        # Utility functions
├── assets/
│   └── icons/          # Custom icons if needed
└── README.md           # This file
```

## 🎨 Design Specifications

### Color Scheme
- **Primary**: #2563eb (Blue)
- **Success**: #10b981 (Green - Income)
- **Danger**: #ef4444 (Red - Expenses)
- **Warning**: #f59e0b (Orange - Warnings)
- **Background**: #f8fafc (Light) / #1e293b (Dark)

### Typography
- **Primary Font**: 'Inter', system-ui, sans-serif
- **Monospace**: 'JetBrains Mono', 'Fira Code', monospace

### Layout
- **Dashboard Grid** - 12-column responsive grid
- **Sidebar Navigation** - Categories and filters
- **Main Content** - Transaction form and data visualization
- **Modal Dialogs** - For detailed transaction editing

## 🚀 Key Functionality

### 1. Transaction Management
```javascript
// Add new transaction
function addTransaction(type, amount, category, description, date) {
    // Validate input
    // Create transaction object
    // Update balance
    // Save to localStorage
    // Refresh UI
}

// Get transactions with filters
function getTransactions(filters = {}) {
    // Apply date, category, type filters
    // Return filtered results
}
```

### 2. Data Visualization
```javascript
// Update expense distribution chart
function updateExpenseChart(transactions) {
    // Group by category
    // Calculate percentages
    // Update pie chart
}

// Update monthly trends
function updateTrendsChart(transactions) {
    // Group by month
    // Calculate totals
    // Update line chart
}
```

### 3. Budget Management
```javascript
// Set category budget
function setBudget(category, amount) {
    // Save budget limit
    // Update progress indicators
}

// Check budget status
function checkBudgetStatus(category) {
    // Calculate spent vs budget
    // Return status and percentage
}
```

## 📱 User Interface Components

### 🏠 Dashboard
- **Summary Cards** - Total income, expenses, balance
- **Quick Add Form** - Fast transaction entry
- **Recent Transactions** - Last 5-10 transactions
- **Chart Area** - Data visualization section

### 📊 Analytics Page
- **Expense Distribution** - Pie chart
- **Monthly Trends** - Line chart
- **Category Comparison** - Bar chart
- **Budget Progress** - Progress bars

### 📋 Transactions Page
- **Transaction List** - Paginated table
- **Filters Panel** - Date, category, type filters
- **Search Bar** - Text-based search
- **Bulk Actions** - Delete, export selected

### ⚙️ Settings Page
- **Categories Management** - Add/edit/delete categories
- **Budget Settings** - Set monthly limits
- **Theme Toggle** - Dark/light mode
- **Data Management** - Export/import, clear data

## 🎯 User Stories

### As a user, I want to...
- [x] **Add expenses quickly** so I can track spending in real-time
- [x] **Categorize transactions** so I can understand spending patterns
- [x] **See my current balance** so I know my financial status
- [x] **View spending trends** so I can make informed decisions
- [x] **Set budgets** so I can control my spending
- [x] **Filter transactions** so I can find specific entries
- [x] **Use on mobile** so I can track expenses on the go
- [x] **Export data** so I can use it in other applications

## 📈 Future Enhancements

### Phase 2 Features
- **Recurring Transactions** - Automatic monthly expenses
- **Multiple Accounts** - Track different bank accounts
- **Currency Support** - Multi-currency tracking
- **Receipt Scanning** - OCR for receipt data extraction

### Phase 3 Features
- **Cloud Sync** - Data synchronization across devices
- **Collaborative Budgets** - Shared family/household budgets
- **Financial Goals** - Savings targets and progress tracking
- **Investment Tracking** - Portfolio management

## 🔧 Development Setup

### Prerequisites
- Modern web browser with ES6+ support
- Text editor or IDE
- Local web server (optional, for development)

### Installation
```bash
# Clone the repository
git clone https://github.com/NGARRIVED/365_days-challenge.git

# Navigate to Day 7
cd 365_days-challenge/Day7

# Open in browser
# Use Live Server extension or similar for development
```

### Development Commands
```bash
# Lint JavaScript
eslint scripts/

# Format code
prettier --write "**/*.{js,css,html}"

# Run tests (if implemented)
npm test
```

## 📝 Learning Objectives

### JavaScript Concepts
- **Local Storage API** - Data persistence
- **Event Handling** - Form submission, user interactions
- **DOM Manipulation** - Dynamic UI updates
- **Array Methods** - Data filtering and transformation
- **Date Handling** - Working with dates and time

### Design Patterns
- **Module Pattern** - Code organization
- **Observer Pattern** - Event-driven updates
- **Factory Pattern** - Object creation
- **Singleton Pattern** - Storage management

### Web Development
- **Responsive Design** - Mobile-first approach
- **Progressive Enhancement** - Core functionality first
- **Accessibility** - ARIA labels, keyboard navigation
- **Performance** - Efficient DOM updates, lazy loading

## 🧪 Testing Strategy

### Manual Testing
- [ ] Add various transaction types
- [ ] Test filtering and search
- [ ] Verify calculations are correct
- [ ] Test responsive design
- [ ] Check data persistence

### Edge Cases
- [ ] Large transaction amounts
- [ ] Special characters in descriptions
- [ ] Date boundary conditions
- [ ] Empty states
- [ ] Storage limitations

## 📚 Resources

### Documentation
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Design Inspiration
- [Dribbble - Expense Tracker](https://dribbble.com/search/expense-tracker)
- [UI Design Patterns](https://ui-patterns.com/)

## 🎉 Success Criteria

### Minimum Viable Product (MVP)
- ✅ Add and delete transactions
- ✅ Categorize expenses
- ✅ Calculate running balance
- ✅ Data persistence in localStorage
- ✅ Basic responsive design

### Full Feature Set
- ✅ Complete data visualization
- ✅ Advanced filtering and search
- ✅ Budget management
- ✅ Export functionality
- ✅ Professional UI/UX

---

**Day 7 Goal**: Build a fully functional expense tracker that demonstrates proficiency in JavaScript, data visualization, and modern web development practices.

*Happy coding! 💪*