@echo off
title Helpdesk Test PostgreSQL (Port 5433)
set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
cd /d "%~dp0"
echo Starting isolated test PostgreSQL database on port 5433...
bun run db:test
