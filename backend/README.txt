BACKEND - data, routing, storage

js/core.js          helpers ($, clamp) and shared state
js/campus-data.js   campus graph: locations, nodes, edges, stairs, floors
js/pathfinding.js   A* route search (with step-free option) and floor heights
js/storage.js       saveState()/loadState() on localStorage (moved out of the UI code)

How the three zips fit together
-------------------------------
Unzip apex-frontend.zip, apex-backend.zip and apex-data-collection.zip into the SAME folder:

  apex/
    frontend/          <- open this one
    backend/
    data-collection/

Then serve the folder (camera and motion sensors need https or localhost):

  cd apex && python3 -m http.server 8000
  open http://localhost:8000/frontend/index.html

The app has no server. It runs entirely in the browser, so "backend" here means
the data, routing and storage logic, not a web server. Script order matters; it is
set in frontend/index.html and matches the original single file.
