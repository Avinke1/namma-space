DATA COLLECTION - room scanner

js/room-scanner.js       camera + motion-sensor scan: mark corners, door, ceiling height, or type the size; saves a room record
scanner-overlay.html     reference copy of the scanner screen markup (the live copy is in frontend/index.html)

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
