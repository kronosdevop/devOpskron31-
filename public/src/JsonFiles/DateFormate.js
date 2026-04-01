/*eslint-disable*/

const { format } = require("date-fns");
const store = require('@/store').default;

function getdateformate(formatMap) {
    var check_date = '';
    const orgDetails = store.getters.GetOrgDetails;
    const organization = orgDetails && orgDetails.organization;
    
    check_date = !organization || organization.date_format == undefined
        ? "dd-MM-yyyy"
        : organization.date_format;
    return check_date.replace(
        /DD|MMM|YYYY|MM/gi,
        (matched) => formatMap[matched]
    );
}

function gettimeformat(formatMap) {
    var check_time = '';
    const orgDetails = store.getters.GetOrgDetails;
    const organization = orgDetails && orgDetails.organization;
    
    check_time = !organization || organization.time_format == undefined
        ? "hh:mm a"
        : organization.time_format;
    return format(formatMap, check_time);
}


function get_date_time(formatMap) {
    var datetimeformate = '';
    const orgDetails = store.getters.GetOrgDetails;
    const organization = orgDetails && orgDetails.organization;
    
    if (
        !organization || organization.date_format == undefined &&
        organization.time_format == undefined
    ) {
        datetimeformate = "dd-MM-yyyy hh:mm a";
    } else if (
        organization && organization.date_format != undefined &&
        organization.time_format == undefined
    ) {
        datetimeformate =
            organization.date_format +
            " " +
            "hh:mm a";
    } else if (
        !organization || organization.date_format == undefined &&
        organization.time_format != undefined
    ) {
        datetimeformate =
            "dd-MM-yyyy" +
            " " +
            organization.time_format;
    } else {
        datetimeformate =
            organization.date_format +
            " " +
            organization.time_format;
    }
    return datetimeformate.replace(/dd|MMM|yyyy|MM|HH|hh|mm|a/gi, matched => formatMap[matched]);
}

function formatDatepicker(dateString, format) {
    if (!dateString) return null;

    // Ensure dateString is a string
    if (typeof dateString !== 'string') {
        console.warn('formatDatepicker: dateString is not a string:', dateString);
        return null;
    }

    // Check if the string contains the expected format (YYYY-MM-DD)
    if (!dateString.includes('-') || dateString.split('-').length !== 3) {
        console.warn('formatDatepicker: Invalid date format:', dateString);
        return null;
    }

    const [year, month, day] = dateString.split("-");

    // Validate that we have valid year, month, day
    if (!year || !month || !day) {
        console.warn('formatDatepicker: Missing date components:', { year, month, day });
        return null;
    }

    const date = new Date(`${year}-${month}-${day}`);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        console.warn('formatDatepicker: Invalid date created from:', dateString);
        return null;
    }

    const timestamp = date.getTime() / 1000;

    return format_Datepicker(timestamp, format);
}
function format_Datepicker(timestamp, format) {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const numericMonth = String(date.getMonth() + 1).padStart(2, "0");
    const fullMonthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const fullMonthName = fullMonthNames[date.getMonth()];
    const year = date.getFullYear();

    const formatMap = {
        dd: day,
        MM: numericMonth,
        yyyy: year,
        MMM: fullMonthName,
    };
    return format.replace(
        /DD|MMM|YYYY|MM/gi,
        (matched) => formatMap[matched]
    );
}
function format_Date(timestamp) {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const numericMonth = String(date.getMonth() + 1).padStart(2, "0");
    const fullMonthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const fullMonthName = fullMonthNames[date.getMonth()];
    const year = date.getFullYear();

    const formatMap = {
        dd: day,
        MM: numericMonth,
        yyyy: year,
        MMM: fullMonthName,
    };
    return getdateformate(formatMap)
    // return format.replace(
    //     /DD|MMM|YYYY|MM/gi,
    //     (matched) => formatMap[matched]
    // );
}
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    // return format(date, formatString);
    return gettimeformat(date)
}
function formatedatetime(timestamp) {

    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const numericMonth = String(date.getMonth() + 1).padStart(2, "0");
    const fullMonthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const fullMonthName = fullMonthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const formatMap = {
        dd: day,
        MM: numericMonth,
        yyyy: year,
        MMM: fullMonthName,
        HH: hours,
        hh: (hours % 12 || 12),
        mm: minutes,
        a: hours >= 12 ? 'PM' : 'AM'
    };
    return get_date_time(formatMap)
    // return datetimeformate.replace(/dd|MMM|yyyy|MM|HH|hh|mm|a/gi, matched => formatMap[matched]);
}
function formatdisplayDate(dateString) {
    if (dateString == 'N/A') {
        return dateString
    }

    // Ensure dateString is a string
    if (typeof dateString !== 'string') {
        console.warn('formatdisplayDate: dateString is not a string:', dateString);
        return dateString || 'N/A';
    }

    const [year, month, day] = dateString.split("-");
    if (day == undefined) {
        return dateString
    }

    const dayPadded = day.padStart(2, "0");
    const numericMonthPadded = month.padStart(2, "0");

    const fullMonthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const fullMonthName = fullMonthNames[parseInt(month, 10) - 1];

    const formatMap = {
        dd: dayPadded,
        MM: numericMonthPadded,
        yyyy: year,
        MMM: fullMonthName,
    };

    return getdateformate(formatMap);
}

module.exports = {
    formatDatepicker,
    format_Date,
    formatTime,
    formatedatetime,
    formatdisplayDate
};
