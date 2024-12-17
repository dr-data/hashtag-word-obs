# Chat Fill Overlay

A real-time interactive overlay that fills up based on chat messages. Perfect for stream engagement and audience participation moments. When viewers type "ready" in chat, it progressively fills a text overlay, creating an engaging visual feedback loop for your stream.

## Features

- Real-time text fill animation based on chat messages
- Exponential fill rate for dynamic progression
- Synchronized across multiple browser sources
- Visual explosion effect at 90% completion
- Test and reset functionality
- Compatible with Social Stream Ninja

## Folder Structure

```
chat-overlay/
├── client/                     # Frontend React application
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   └── FillOverlay.js # Main overlay component
│   │   ├── App.js             # Root React component
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind CSS configuration
├── server.js                  # Backend server
└── package.json               # Backend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Social Stream Ninja account

## Installation

1. Clone or download this repository:
```bash
git clone [repository-url]
cd chat-overlay
```

2. Install backend dependencies:
```bash
npm install express ws cors path
```

3. Install frontend dependencies:
```bash
cd client
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..
```

4. Build the frontend:
```bash
cd client
npm run build
cd ..
```

5. Start the server:
```bash
node server.js
```

The application will be running at `http://localhost:3001`

## Setting Up with Social Stream Ninja

1. **In Social Stream Ninja:**
   - Go to your overlay settings
   - Find the webhook configuration section
   - Set the following parameters:
     - Chat Command: `ready` (without the #)
     - Webhook URL: `http://your-server:3001/webhook`
     - Method: Select "POST"
     - Enable "Trigger only if full message matches exactly"

2. **In OBS/Streaming Software:**
   - Add a new Browser Source
   - Set the URL to `http://localhost:3001`
   - Set width and height as needed (recommended: 1920x1080)
   - Optional: Add a color key filter if you want to remove the background

## Usage

### For Streamers
1. Ensure the server is running before starting your stream
2. Add the browser source to your scene
3. When you want to check if viewers are ready:
   - Ask them to type "ready" in chat
   - Watch the overlay fill up as viewers participate
   - At 90% fill, a celebration animation will trigger

### For Testing
- Use the built-in test button to simulate chat messages
- Use the reset button to clear the progress
- Open multiple browser sources to verify sync functionality

### For Viewers
- Simply type "ready" in chat when prompted
- Watch as their participation contributes to filling the overlay

## Customization

### Adjusting Fill Rate
In `client/src/components/FillOverlay.js`, modify the `k` value:
```javascript
const k = 10; // Lower number = faster fill, Higher number = slower fill
```

### Changing the Text
In the same file, find the text "READY!" and replace it with your desired text.

### Modifying Colors
- Text outline: Modify the `WebkitTextStroke` and `textShadow` values
- Fill color: Change the gradient values in `background: 'linear-gradient()'`

## Troubleshooting

### Common Issues

1. **Overlay not appearing:**
   - Check if server is running
   - Verify the browser source URL
   - Check console for errors (F12 in browser)

2. **Messages not registering:**
   - Confirm webhook URL in Social Stream Ninja
   - Check server console for incoming messages
   - Verify the exact message text matches ("ready")

3. **Tabs not syncing:**
   - Ensure WebSocket connection is established
   - Check for any console errors
   - Verify you're using the same port across all instances

### Server Logs
Monitor the server console for:
- Incoming webhook messages
- WebSocket connections/disconnections
- Any error messages

## License

MIT License - Feel free to modify and use in your streams!

## Support

For issues and feature requests, please open an issue on the GitHub repository or contact [your-contact-info].

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.