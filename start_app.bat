@echo off
cd /d "%~dp0"
start http://192.168.1.105:8000
python -m http.server 8000
