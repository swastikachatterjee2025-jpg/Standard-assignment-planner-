# Smart Assignment Planner

Smart Assignment Planner is a colourful, responsive university productivity website built with HTML, CSS, and JavaScript. It helps students manage assignments, deadlines, priorities, completion progress, and monthly planning.

## Features

- Premium landing page with animated hero text and custom productivity artwork
- Dashboard with total, completed, pending, and productivity percentage stats
- Add, edit, delete, and complete assignments
- Subject, title, description, due date, due time, and priority fields
- High, medium, and low priority labels
- Search, subject filter, priority filter, and completion status filter
- Priority sorting
- Countdown labels, urgent reminders, and overdue highlighting
- Interactive monthly calendar with colour-coded deadlines
- Motivational quote section
- Dark and light mode toggle
- Responsive sidebar navigation
- Floating add button
- Confetti animation when a task is completed
- Local Storage persistence after refresh

## Technologies

- HTML5
- CSS3
- JavaScript
- Local Storage
- Font Awesome icons
- CSS Grid and Flexbox

## Folder Structure

```text
.
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Installation

1. Clone or download the repository.
2. Open the project folder.
3. Open `index.html` in a browser.

No build step is required.

## Deployment

You can deploy this static website on GitHub Pages, Netlify, Vercel, or any static hosting provider.

### GitHub Pages

1. Push the project to a GitHub repository.
2. Go to repository settings.
3. Open **Pages**.
4. Select the main branch and root folder.
5. Save and open the generated GitHub Pages URL.

## Optional Firebase Integration

The app currently uses Local Storage for beginner-friendly persistence. Firebase can be added later by replacing the Local Storage functions in `script.js` with Firestore create, read, update, and delete calls.
