@echo off
rem Double-click this file to play "The Lost Letters of Us" on this computer.
rem It starts a tiny local web server (needed for the photos) and opens the game in your browser.
rem Keep this black window open while playing; close it when you're done.
cd /d "%~dp0"
start "" http://localhost:8123
python -m http.server 8123
