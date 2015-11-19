/**
 * Created by Дмитрий on 04.01.2015.
 */
var App = {
    Router: {},
    Models: {},
    Collections: {},
    Views: {},
    Events: {},
    Functions: {}
};
define(['backbone', 'underscore', 'jquery', 'jquery.cookie', 'security'], function(Backbone, _, $) {
    
    App.Events = _.extend({}, Backbone.Events);
    var app = {
        config: {
            urlAPI: "http://localhost/index.php/method/",
            client_id: 'web'
        },
        cache: []
    };
    // Переписать
    Backbone.sync = function(method, model, options) {
        //console.log(method, model, options);
        var params = {
            url: app.config.urlAPI + model.url,
            type: 'GET',
            dataType: 'json'
        };

        params.data = options.params || {};

        if ($.cookie('user_id')) {
            params.data.access_token = $.cookie('token');
        }

        var success = options.success;
        options.success = function (resp) {
            if (resp.error) {
                resp = resp.error;
                if(resp.description == "You are not logged") {
                    window.location.href = "/";
                }
                var code = { message: resp.description };
                console.log(code);
                model.trigger('error', code, xhr, options);
                return false;
            }

            model.trigger('before:add', model, resp.response, options);

            //for (var i=0; i < resp.response.count; i++) {
            if(model.url != '../token') { success(resp.response); }

            //model.trigger('add', model, resp.response, options);
        };


        var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
        //if(typeof xhr.responseJSON['error'] !== "undefined") {
        //    console.log("error");
        //}

        model.trigger('request', model, xhr, options);
        return xhr;
    };

    App.Views.Modal = Backbone.View.extend({
        events: {
            'click .btn-submit': 'submit',
            'click .btn-close': 'close'
        },
        initialize: function () {
            this.template =_.template($('#modal-template').html());
        },

        submit: function() {
            this.trigger('submit');
        },
        close: function() {
            this.trigger('close');
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Functions.Message = function(message) {
        var text = '';
        
        if(typeof message == 'object') {
            for (var item in message)
                for(var i in message[item])
                    text += message[item][i] + '\n';

            return text;
        }

        return message;
    };

    var securnost = require('security');

    new securnost(function() {

    });
});