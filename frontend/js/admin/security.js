/**
 * Created by dmitry on 11.09.15.
 */

define(['backbone', 'underscore', 'wrapper', 'router'], function(Backbone, wrapper, router) {
    return Backbone.Model.extend({
        url: 'check.permission',


        initialize: function() {
            this.fetch();

        },

        parse: function (data) {
            if(data.status != 'admin')
                alert('Прости, но ты не бро!');
            else {
                var router = require('router');
                // Инициализация роутинга
                new router();
            }
        },


    });
});