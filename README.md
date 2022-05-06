# amazing_signaling_server

MQTT broker & WebRTC signaling server, matching clients at home with a the most recent active office device (rpi).

## Requirements

For running the following tools have to be installed on the system:
- node
- npm
- docker

## Running signaling server

Change the host and port variables in the server.js file to correct values for your system and run:

```bash
npm install
node server.js
```

## Running in docker

Change the host and port variables in the server.js file to correct values for your system and run:

```bash
docker compose up -d
```

This start and expose both a MQTT broker and a signaling server.
