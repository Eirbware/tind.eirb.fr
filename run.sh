#!/usr/bin/env sh

./backend/pocketbase serve &
serve -p 6767 ./backend/pb_public/
