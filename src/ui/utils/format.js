import { format } from "date-fns";

export const ToDateStr = date => {
    return format(new Date(date * 1000), "MM/dd/yyyy");
}

export const FindMostTestsOnADay = data => {
    let longest = 0;
    data.map(day => {
        if (day.length > longest) {
            longest = day.length;
        }
    });
    return longest;
}