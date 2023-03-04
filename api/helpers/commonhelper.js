const moment = require("moment");
const { date } = require("joi");
const pdf2base64 = require('pdf-to-base64');
const { logger } = require("./logger");
const nodemailer = require('nodemailer');
let AWS = require('aws-sdk');





var currentTime = new Date();
var currentOffset = currentTime.getTimezoneOffset();
var ISTOffset = 330;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

exports.sendEmail = function (emailBody,isHtml) {
    let mailOptions;
    if(isHtml){
        mailOptions = {
            from: process.env.FROM_EMAIL,
            to: emailBody.to,
            subject: emailBody.subject,
            html: emailBody.body
          };
          console.log(mailOptions)
    }else{
        mailOptions = {
            from: process.env.FROM_EMAIL,
            to: emailBody.to,
            subject: emailBody.subject,
            text: emailBody.body
          };
          
    }
   
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        } else {
          logger.info('Email sent: ' + info.response); 
          console.log('Email sent: ' + info.response);
        }
      });
}

exports.uploadToS3 = async function (userId,file,t,ContentType,typ) {
    const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;
  
    AWS.config.setPromisesDependency(require('bluebird'));
    AWS.config.update({ accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, region: AWS_REGION });
  
    const s3 = new AWS.S3();
  
    const base64Data = new Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  
    let type;
    if(typ){
      type = typ;
    }else{
      type = file.split(';')[0].split('/')[1];
    }
    let k;
     if(!ContentType){
      ContentType=  `image/${type}`;
     }
   // console.log(type)
    if(ContentType == 'application/octet-stream'){
      k = `${userId}/${userId}_${t}.${typ}`;
    }else{
      k = `${userId}/${userId}_${t}.${type}`
    }
    const params = {
      Bucket: S3_BUCKET,
      Key:k, // type is not required
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64', // required
      ContentType // required. Notice the back ticks
    }
  
     let location = '';
     let key = '';
  
      const { Location, Key } = await s3.upload(params).promise();
      location = Location;
      key = Key;
   
  
    return location;
  
  }

exports.removeSpecialCharacter = function (string) {
    let finalString = string.replace(/[^a-zA-Z ]/g, "");
    return finalString;
}
exports.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}
exports.asyncForEachObject = async (array, callback) => {
    for (const [key, value] of Object.entries(array)) {
        await callback(key, value, array)

    }
}
exports.minuteDiffence = (date1,date2) => {
    let diffMs = (date1 - date2);
    let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); 
    return diffMins;
}
exports.getDate = (date) => {
    if (date) {
        date = date.toDateString().split("T");
        return date[0];
    }
    return "";
}
exports.capitalizeFLetter = (input) => {
    return input.replace(/^./, input[0].toUpperCase());
}

exports.getUniqueKeys = (array, keyName) => {
    var flags = [], output = [], l = array.length, i;
    for (i = 0; i < l; i++) {
        if (flags[array[i][keyName]]) continue;
        flags[array[i][keyName]] = true;
        output.push(array[i][keyName]);
    }
    return output;
}

exports.createMeetingString = (meetingSeetings) => {
    let meetingSettingsString = "";
    if (meetingSeetings.length) {
        for (let i = 0; i < meetingSeetings.length; i++) {
            let key = meetingSeetings[i].setting_name;
            let val = meetingSeetings[i].setting_value;
            meetingSettingsString += '&' + key + '=' + val;
        }
    }
    return meetingSettingsString;
}
exports.comparer = (list1, list2, isUnion) => {
    var result = [];

    for (var i = 0; i < list1.length; i++) {
        var item1 = list1[i],
            found = false;
        for (var j = 0; j < list2.length && !found; j++) {
            found = "F" + item1.event_booth_id === list2[j].meetingID;
            if (found) {
                item1.participantCount = list2[j].participantCount;
            } else {
                item1.participantCount = 0;
            }
        }
        // if (found === !!isUnion) { // isUnion is coerced to boolean
        result.push(item1);
        // }
    }
    return result;
}
exports.comparerDate = (list1, list2, isUnion) => {

    for (var j = 0; j < list2.length; j++) {
        // let date = new Date(new Date(list2[j].date).getTime() + (ISTOffset + currentOffset) * 60000).getDate().toString();
        // let startTime = new Date(new Date(list2[j].date).getTime() + (ISTOffset + currentOffset) * 60000).getHours();
        // let endTime = new Date(new Date(list2[j].date_end).getTime() + (ISTOffset + currentOffset) * 60000).getHours();
        // list1 = list1.filter(dataList1 =>
        //     ((dataList1.getDate().toString() == date) && ((dataList1.getHours() >= + startTime) && (dataList1.getHours() <= + endTime))));
        let startDate = new Date(new Date(list2[j].date).getTime() + (ISTOffset + currentOffset) * 60000);
        let endDate = new Date(new Date(list2[j].date_end).getTime() + (ISTOffset + currentOffset) * 60000);
        list1 = list1.filter(dataList1 => {
            let timeNow = dataList1;
            if ((timeNow.getDate() == startDate.getDate()) && (timeNow.getTime() >= startDate.getTime() && timeNow.getTime() <= endDate.getTime())) {
                return false;
            } else {
                return true;
            }

        }
        )
    }
    list1 = list1.map(data => {
        data = moment(data).format("DD-MMM-YYYY HH:mm:ss");
        return data;
    })

    return list1;
}
exports.differenceInseconds = (startTime, endTime) => {
    var result = [];

    let duration = moment.duration(endTime.diff(startTime));
    return duration;
}
exports.isValidDateTimeFn = (data) => {
    let curDate = new Date();
    let eventDate = this.getDate(data.event_date);
    let startDate = new Date(eventDate + " " + data.start_time);
    let endDate = new Date(eventDate + " " + data.end_time);
    if (endDate >= curDate) {
        this.isEventCompleted = false;
    } else {
        this.isEventCompleted = true;

    }
    if ((startDate <= curDate) && (endDate >= curDate)) {
        return true;
    } else {
        return false
    }
}

exports.getDateArray = (startDate, endDate, addFn, interval) => {
    addFn = addFn || Date.prototype.addDays;
    interval = interval || 1;

    var retVal = [];
    var current = new Date(new Date(startDate.getTime() + (ISTOffset + currentOffset) * 60000).setHours(00, 00, 00));

    while (current <= endDate) {
        retVal.push(new Date(current.getTime() + (ISTOffset + currentOffset) * 60000));
        current = addFn.call(current, interval);
    }

    return retVal;
}
Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}
exports.isUuid = (id) => {
    var patt = new RegExp("[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}");
    return patt.test(id);
}
exports.pdf2base64 = (file) => {
    return pdf2base64(file)
        .then(
            (response) => {
                return ({ status: 200, response: response }); //cGF0aC90by9maWxlLmpwZw==
            }
        )
        .catch(
            (error) => {
                return ({ status: 500, response: error });                //Exepection error....
            }
        )
}

exports.compareArrayObject = (otherArray) => {
    return function (current) {
        return otherArray.filter(function (other) {
            return other.session_name == current.session_name
        }).length == 0;
    }
}

exports.objectToQueryString = (obj) => {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

exports.renderLogMessage = (data)=> {
    let {user_name,lead_first_name,lead_last_name,type,to_value,from_value,operation_type} = data;
    let renderTemplate = {
        'lead-create':` ${user_name} created lead ${lead_first_name} ${lead_last_name} `,
        'lead-home-address-create': `${user_name} added home address for lead ${lead_first_name} ${lead_last_name} `,
        'lead-additional-information-create':  `${user_name} added additional infromation for lead ${lead_first_name} ${lead_last_name} `,
        'lead-business-address-create':  `${user_name} added buisness address for lead ${lead_first_name} ${lead_last_name} `,
        'lead-home-address-update': `${user_name} updated home address value ${type}: from ${from_value} -> ${to_value} for lead ${lead_first_name} ${lead_last_name} `,
        'lead-additional-information-update':`${user_name} updated additional information value ${type}: from ${from_value} -> ${to_value} for lead ${lead_first_name} ${lead_last_name} `,
        'lead-buisness-address-update': `${user_name} updated buisness address value ${type}: from ${from_value} -> ${to_value} for lead ${lead_first_name} ${lead_last_name} `,
    }
    return renderTemplate[operation_type];
}

exports.jsonDifference = (obj1,obj2) => {
    let keys = Object.keys(obj2);
    let ans = [];
    for(let i= 0;i<keys.length;i++){
        if(obj2[keys[i]]!=obj1[keys[i]]){
            ans.push([keys[i],obj1[keys[i]],obj2[keys[i]]]);
        }
    }
    return ans;
}