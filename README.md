# pm2 Stuff

#### To be ran once:

`sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u rscibelli --hp /home/rscibelli`

This command will add pm2 into the OS so that pm2 is always started back up after reboot. 

#### Deploy new code:

`bash deploy-rscibelli-backend.sh`

This is already configured to reload the pm2 process on the raspberry pi, and save the pm2 configuration so that it can come back on system reboot.

# What is this App?

This is an Express.js application that generates a running analysis for me (Rob).

It runs a cron job every morning at 6am EST where it pulls my data from Garmin using a Garmin MCP with Gemini, converts the data to imperial units using Gemini again, and passes that data back to Gemini again to generate a running analysis.

This data is then stored in a locally hosted mySql db in two tables: summary, runs. The runs table includes a foreign key to the summary table, so that every run is associated to a summary.

There is then a GET endpoint that returns back the latest summary in the db along with all the runs associated to it.

There is also a POST endpoint that allows me to run the process manually to generate another summary from Gemini.

# What's in this App?

Services:
- Running analysis service
- Golf analysis service (which currently doesn't work)

Interfaces:
- Gemini interface with MCP option & schema option
- DB interface to my local db

