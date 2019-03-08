'use strict';

var helpers = module.exports;

helpers.phoneNumber = function(num) {
    num = num.toString();

    return '(' + num.substr(0, 3) + ') '
      + num.substr(3, 3) + '-'
      + num.substr(6, 4);
};