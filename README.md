# Namma Space — 3D Indoor Navigation Demo

A beginner-friendly front-end prototype with a 3D sample floor plan, searchable places, route display, and A* grid pathfinding.

## Included
- `index.html` — page structure and controls
- `style.css` — responsive styling
- `app.js` — Three.js scene, search, place selection, and A* pathfinding

## Run it locally
Because the app uses JavaScript modules, open it through a local web server rather than double-clicking the HTML file.

### Option A: VS Code + Live Server
1. Open this repository in Visual Studio Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Keep an internet connection enabled; Three.js and fonts are loaded from CDNs.

### Option B: Python
Run this in the project folder:
```bash
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

## How to use
- Search for a destination, or choose a popular place.
- A route is calculated from **Main Entrance** using A* grid pathfinding.
- The path avoids the sample obstacles.
- Drag the map to rotate, scroll to zoom, and use the + / − buttons.
- Use **Labels** and **Route** to show or hide those layers.
- Press `/` to focus search.

## Important limitations
This is a concept demo, not an official Namma Space map and not connected to a real building. The floor plan and points of interest are sample data. It does not include live positioning, multi-floor routing, indoor GPS, backend services, or augmented reality. Do not use it for emergency evacuation or accessibility-critical directions without professional validation.