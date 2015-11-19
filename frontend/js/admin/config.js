define(['jquery', 'underscore', 'backbone', 'wrapper', 'moment', 'datetimepicker'], function($, underscore, Backbone, wrapper, moment) {

    currentTime = Backbone.Model.extend({
        url: 'timer.current',

        parse: function(data) {
            return data;
        }
    });

    dataSetting = Backbone.Model.extend({
        initialize: function(method) {
            this.setMethod(method);
        },

        url: 'settings.get',

        setMethod: function(method) {
            this.method = (method == 'get' ? 'get' : 'set');
            this.setUrl();
        },

        setUrl: function(string) {
            this.url = 'settings.' + (string || this.method);
        }

    });

    return Backbone.View.extend({
        el: '.container',
        template: new EJS({url: 'templates/admin/config/main.ejs'}).text,
        events: {
            "click .submit-datetime": 'changeDate'
        },
        changeDate: function() {
            this.$el.find('.success-message').hide();
            var date = new dataSetting('set');
            date.fetch({ params: { key: 'datetime_start', value: this.$el.find('#datetime_start input').val() } });
            date.fetch({ params: { key: 'datetime_end', value: this.$el.find('#datetime_end input').val() } });
            
            var self = this;

            this.listenTo(date, 'sync', function() {
                self.$el.find('.success-message').show();
            });
        },

        setDate: function(data) {
            $('#'+data.get('k')).datetimepicker({
                locale: 'ru',
                format: "DD-MM-YYYY HH:mm:ss",
                defaultDate: moment(data.get('value'), 'DD-MM-YYYY HH:mm:ss')
            });
        },

        setCurrentTime: function(data) {
            var self = this;
            this.timer = setInterval(function() {
                var date = moment.unix(data.get('time')).format('DD MMMM YYYY, HH:mm:ss');
                self.$el.find('.current-time').text(date);

                data.set({ 'time': data.get('time') + 1 });
            }, 1000);

            var date = moment(data.get('time')*1000).format('DD MMMM YYYY, HH:mm:ss');
            
            this.$el.find('.current-time').text(date);
        },

        destructTimer: function() {
            clearInterval(this.timer);
        },

        initialize: function() {
            var self = this;

            wrapper.updateMenu('config');

            wrapper.renderPage(this.template);

            this.currentTime = new currentTime();
            this.date = new dataSetting('get');

            this.listenTo(this.currentTime, 'sync', this.setCurrentTime);
            this.listenTo(this.date, 'sync', this.setDate);

            this.currentTime.fetch();
            this.date.fetch({ params: { key: 'datetime_start' }});
            this.date.fetch({ params: { key: 'datetime_end' }});

            App.Events.on('page:update', function() {
                self.destructTimer();
            });

            moment.locale('ru');
        }
    });
});