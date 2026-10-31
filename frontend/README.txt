FRONTEND - APEX 3D Campus Walkthrough

index.html                      page markup, styles, script loading order
js/scene-and-navigation.js      three.js scene, labels, route ribbon, orbit/walk/AR camera, QR, minimap, UI wiring
js/my-rooms.js                  builds saved rooms in 3D, My rooms list
js/campuses-and-init.js         multiple places (campus/house/office) and app start-up

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
