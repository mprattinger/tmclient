#!/bin/sh
# tmcautostart.sh
# Run tmc client app on reboot
echo "Test" > text.txt
cd /
cd home/pi/dev/nodejs/tmclient/
sudo node app.js
cd /
