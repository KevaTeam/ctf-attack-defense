requirejs.config({
    baseUrl: 'js/admin',
    paths: {
        app: '../app',
        jquery: '//yastatic.net/jquery/2.1.3/jquery.min',
        'jquery.cookie': '/js/vendors/jquery.cookie',
        backbone: '//yastatic.net/backbone/1.1.2/backbone',
        bootstrap: '//yastatic.net/bootstrap/3.3.1/js/bootstrap.min',
        underscore: '//yastatic.net/underscore/1.6.0/underscore-min',
        ejs: 'ejs',
        moment: '../vendors/moment',
        datetimepicker: '../vendors/datetimepicker',


        helpers: 'admin/helpers/helpers'
    }
});

requirejs(['main']);