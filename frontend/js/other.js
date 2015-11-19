/**
 * Created by Дмитрий on 05.01.2015.
 */
function rulesTime(number,arr) {
    cases = [2, 0, 1, 1, 1, 2];
    return number + ' ' + arr[ (number%100 > 4 && number%100<20) ? 2 : cases[(number%10<5)?number%10 : 5] ] + ' назад';
}

function rulesRus(number,arr) {
    cases = [2, 0, 1, 1, 1, 2];
    return number + ' ' + arr[ (number%100 > 4 && number%100<20) ? 2 : cases[(number%10<5)?number%10 : 5] ];
}

function rulesDeclination(number,arr) {
    cases = [2, 0, 1, 1, 1, 2];
    return arr[ (number%100 > 4 && number%100<20) ? 2 : cases[(number%10<5)?number%10 : 5] ];
}

function timeAgo(time) {
    var timeArr = [
        ['секунду','секунды','секунд'],
        ['минуту','минуты','минут'],
        ['час','часа','часов']
    ];
    var timeNow = (new Date()).getTime(),
        diff = Math.floor(timeNow/1000) - time;

    if (diff < 60) {
        return rulesTime(diff, timeArr[0]);
    } else if (diff < 3600) {
        return rulesTime(Math.floor(diff / 60), timeArr[1]);
    } else if (diff < 86400) {
        return rulesTime(Math.floor(diff / 3600), timeArr[2]);
    } else {
        return "Уже давно";
    }


}

function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function add_target(str) {
    return str.replace(/<a href/g, '<a target="_blank" href');
}
