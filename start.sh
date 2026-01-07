#!/bin/bash

echo "Starting BlogIt servers..."

# Start server in background
cd server
npm run dev > ../server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait a bit for server to start
sleep 3

# Start client in background
cd ../client
npm run dev > ../client.log 2>&1 &
CLIENT_PID=$!
echo "Client started with PID: $CLIENT_PID"

echo "Both servers running!"
echo "Server: http://localhost:5000"
echo "Client: http://localhost:5173"
echo ""
echo "To stop, run: kill $SERVER_PID $CLIENT_PID"
