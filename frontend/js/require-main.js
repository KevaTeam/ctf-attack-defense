/**
 * Created by shipko on 05.09.15.
 */

requirejs.config({
    baseUrl: 'js/client',
    paths: {
        app: '../app',
        jquery: '//yastatic.net/jquery/2.1.3/jquery.min',
        'jquery.cookie': '/js/vendors/jquery.cookie',
        backbone: '//yastatic.net/backbone/1.1.2/backbone',
        bootstrap: '//yastatic.net/bootstrap/3.3.1/js/bootstrap.min',
        underscore: '//yastatic.net/underscore/1.6.0/underscore-min',
        ejs: 'ejs',
        moment: '../vendors/moment',
        datetimepicker: '../vendors/datetimepicker'
    }
});

requirejs(['main']);