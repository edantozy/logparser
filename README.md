# logparser
A log parser app with Geo & CSV export functionalities.

This log parser can:
- read an access a log file
- resolve Country and City from IP address with GeoLite2 Free
- translate the user agent to device type and browser
- create a new log file with the Country, City, Device and Browser fields
- create a CSV file with the fields
- - -

## Folder Structure
    .\
    \log  Folder to save generated logs and with the gobankingrates-short.log file
    \csv  Folder to save the exported CSV files
    \.gitignore  Git ignore file
    \.dockerignore  Docker ignore file
    \Dockerfile  Docker configuration
    \index.js Log parser code
    \package.json Npm package manager file
    \package.lock.json Npm auto-generated file
    \README.MD  This file

- - -

## How to run the project
### First Option - Run with npm
#### Prerequisites
Have node.js with npm installed

1. Open terminal, go to the project folder and run the command ``` npm install ```
2. Next, run this command ``` npm start ```
3. The application will start

### Second Option - Run with docker
#### Prerequisites
Have docker installed

1. Open terminal, go to the project folder an run the command ``` docker build -t <container name> . ```
2. Next, run this commmand ``` docker run -it <container name> ```
3. The application will start

In docker all files will be created in the same folder where the container is located.

- - -
It will start reading the file defined in the index.js file and located in the /log folder with the name gobankingrates-short.log to later connect with the GeoLite2 Free service and obtain the location information according to the IP of each record located in the file.

**Important: GeoLite2 Free only allows to send 1000 queries for a day**

Using the user agent of each log line within the file, it will try to get the device and browser.

After that, it will try to write the information obtained in a new file called geodevicegobankingrates-short.log adding the country, city, device and browser fields at the end of each record.

Finally, it will generate a file inside the /csv folder with the name geodevicegobankingrates-short.log.csv with the information obtained.
