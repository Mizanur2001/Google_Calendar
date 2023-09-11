const { google } = require('googleapis');
require('dotenv').config();

// Provide the required configuration
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google calendar API settings
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
);

// Your TIMEOFFSET Offset
const TIMEOFFSET = '+05:30';

// Get date-time string for calender
const convertDateToFormat = (inputDate, timeString) => {
    let date = new Date(inputDate);
    const [startHourString, endHourString] = timeString.split('-');
    const isStartPM = startHourString.includes("PM");
    const isEndPM = endHourString.includes("PM");
    let startHour = parseInt(startHourString.match(/\d+/));
    let endHour;
    
    if (endHourString) {
        endHour = parseInt(endHourString.match(/\d+/));
        
        if (isStartPM && startHour !== 12) {
            startHour += 12;
        }
        
        if (isEndPM && endHour !== 12) {
            endHour += 12;
        }
        
        if (endHour === 12 && startHour === 1) {
            endHour = 13;
        }
        
        if (endHour < startHour) {
            date.setDate(date.getDate() + 1);
        }
    }

    date.setHours(startHour, 0, 0, 0);
    let endDate = endHour ? new Date(date) : undefined;

    if (endDate) {
        endDate.setHours(endHour, 0, 0, 0);
    }

    const startFormatted = date.toISOString();
    const endFormatted = endDate ? endDate.toISOString() : undefined;

    return {
        'start': startFormatted,
        'end': endFormatted
    };
};


// Insert new event to Google Calendar
const insertEvent = async (event) => {

    try {
        let response = await calendar.events.insert({
            auth: auth,
            calendarId: calendarId,
            resource: event
        });

        if (response['status'] == 200 && response['statusText'] === 'OK') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(`Error at insertEvent --> ${error}`);
        return 0;
    }
};

const inputDate = 'Tue Sep 11 2023 00:00:00 GMT+0530 (India Standard Time)';
const timeString = "04PM-06PM";
let dateTime = convertDateToFormat(inputDate, timeString);
console.log(dateTime);

//Event for Google Calendar
let event = {
    'summary': `Meeting With Mizanur Rahaman`,
    'description': `This is the description from Martian Corporation`,
    'start': {
        'dateTime': dateTime.start,
        'timeZone': 'Asia/Kolkata'
    },
    'end': {
        'dateTime': dateTime.end,
        'timeZone': 'Asia/Kolkata'
    }
};

insertEvent(event).then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});