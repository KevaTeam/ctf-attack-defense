/**
 * Created by Дмитрий Муковкин on 22.11.2014.
 */

$(function() {
    Backbone.history.navigate('', {trigger: true});
    var App = {
        config: {
            urlAPI: "http://localhost/index.php/method/",
            client_id: 'web'
        },
        cache: {
            views: {}
        },
        Views: {},
        Models: {},
        Collections: {},
        Events: {},
        VK: 0
    };

    App.Views.Wrapper = Backbone.View.extend({
        el: $('#wrapper'),

        render: function(html) {
            this.$el.html(html);
        }
    });



    _.extend(App.Events, Backbone.Events);

    App.Router = Backbone.Router.extend({
        routes: {
            "login":                "login",
            'tasks':                "tasks",
            "timer":                "timer",
            "logout":               "logout",
            "end":                  "end",
            "": "timer"
        },

        initialize: function() {
            App.Views.Main = new App.Views.Wrapper();
            Backbone.history.start();
        },

        login: function() {
            $.cookie('token', '');
            $.cookie('user_id', '');
            console.log('login');
            new App.Views.Login();
        },

        tasks: function () {
            new App.Views.Tasks();
        },

        timer: function () {
            if(App.cache.views.timer === undefined) {
                App.cache.views.timer = new App.Views.Timer();
            }
            else {
                App.cache.views.timer.init();
            }
        },

        end: function() {
            App.cache.views.end = App.cache.views.end || new App.Views.End();
        },

        logout: function() {
            $.cookie('token', '');
            $.cookie('user_id', '');

            Backbone.history.navigate('login', {trigger: true});
        }

    });


    Backbone.sync = function(method, model, options) {
        //console.log(method, model, options);
        var params = {
            url: App.config.urlAPI + model.url,
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
                    Backbone.history.navigate('login', {trigger: true});
                }
                var code = { /* code: resp.ErrorCode,*/ message: resp.description };
                model.trigger('error', code, xhr, options);
                return false;
            }

            model.trigger('before:add', model, resp.response, options);

            //for (var i=0; i < resp.response.count; i++) {
            if(model.url != '../token') { success(resp.response); }
            //}
            model.trigger('sync', model, resp, options);
            //model.trigger('add', model, resp.response, options);
        };


        var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
        //if(typeof xhr.responseJSON['error'] !== "undefined") {
        //    console.log("error");
        //}

        model.trigger('request', model, xhr, options);
        return xhr;
    };


    App.Views.Timer = Backbone.View.extend({
        id: 'timer',

        initialize: function () {
            App.Events.on("start:finish", this.startEndTimer, this);

            this.init();
        },
        timer: {
            seconds: '',
            minutes: '',
            hours: ''
        },

        init: function() {
            var Timer = new App.Models.Timer();
            // console.log
            this.listenTo(Timer, "change", this.setTime);
            // Render template
            this.listenToOnce(this, 'render', this.renderOnce);
            console.log(this);

            Timer.fetch();

            this.render()
        },

        renderOnce: function() {
            this.$el.html(new EJS({url: 'templates/timer/Timer.ejs'}).render());
        },

        render: function() {
            App.Views.Main.render(this.$el);
        },

        setTime: function(time) {
            console.log('Timer: change');
            console.log(this, time);
            this.trigger('render');

            this.time = time;
            var timestamp = time.get('start');
            if(timestamp == 0) {
                console.log('start game');
                App.Events.trigger('start_game');
                return false;
            }

            this.updateTime(timestamp, $('#timerStart'));

            //А теперь обновляем время

            var self = this;

            App.cache['timerStart'] = setInterval(function () {
                timestamp --;
                if(timestamp == 0)
                    App.Events.trigger('start_game');

                self.updateTime(timestamp, $('#timerStart'));
            }, 1000);


        },
        startEndTimer: function() {
            console.log(this);
            App.cache['timerTimestamp'] = this.time.get('end');

            var self = this;
            console.log(App.cache['timerTimestamp']);
            if(App.cache['timerTimestamp'] > 0) {
                // Запускаем игру

                Backbone.history.navigate('tasks', {trigger: true});

                console.log('start end timer');
                App.cache['timerEnd'] = setInterval(function () {
                    App.cache['timerTimestamp'] --;
                    
                    self.updateTime(App.cache['timerTimestamp'], $('#timerEnd'));

                    // Делаем таймер тру
                    if(App.cache['timerTimestamp'] < 3600) {
                        $('.hours, .text-hours').hide();
                    }
                    if(App.cache['timerTimestamp'] < 60) {
                        $('.minutes, .text-minutes').hide();
                        $('.seconds, .text-seconds').show();
                    }
                    if(App.cache['timerTimestamp'] <= 0) 
                        App.Events.trigger('end_game');
                    
                }, 1000);
            }
            else { // Игра уже закончилась
                console.log('stop game');
                App.Events.trigger('end_game');
            }
        },
        updateClass: function(number, arr) {
            $('#endTime').text(rulesDeclination(number, arr));
        },

        updateTime: function(timestamp, node) {
            App.cache['hours'] = Math.floor(timestamp / 3600);
            App.cache['minutes'] = Math.floor((timestamp - (App.cache['hours'] * 3600)) / 60);
            App.cache['seconds'] = timestamp - (App.cache['hours'] * 3600) - (App.cache['minutes'] * 60);
                
            $(node).find('.seconds').text(App.cache['seconds']);
            $(node).find('.text-seconds').text(rulesDeclination(App.cache['seconds'], ['секунда','секунды','секунд']));

            $(node).find('.minutes').text(App.cache['minutes']);
            $(node).find('.text-minutes').text(rulesDeclination(App.cache['minutes'], ['минута','минуты','минут']));

            $(node).find('.hours').text(App.cache['hours']);
            $(node).find('.text-hours').text(rulesDeclination(App.cache['hours'], ['час','часа','часов']));
        }
    });

    App.Views.End = Backbone.View.extend({
        el: $('#wrapper'),
        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html(new EJS({url: 'templates/end/Main.ejs'}).render());
        }
    });

    App.Models.Timer = Backbone.Model.extend({
        url: 'timer.get',
        parse: function(time) {
            return time;
        }
    });

    App.Views.Tasks = Backbone.View.extend({
        id: "tasks",

        initialize: function() {

            this.render();
            if (!$.cookie('feedback') || $.cookie('feedback') != 1) {
                setTimeout(function() {
                    App.Views.Main.$el.find('.modal-content').html(new EJS({url: 'templates/quest/Feedback.ejs'}).render({}));
                    $('#myModal').modal({})
                    $.cookie('feedback', 1, { expires: 10 });
                }, 4000);
            }
            new App.Views.UserList({ el: this.$el.find('#users') });

            new App.Views.QuestList({ el: this.$el.find('#quest') });

            App.Views.Main.render(this.$el);
        },
        render: function() {
            this.$el.html(new EJS({url: 'templates/quest/Wrapper.ejs'}).render());
            return this;
        }
    });

    var QuestCategory = Backbone.Model.extend({
        parse: function (response) {
            return response;
        }
    });

    App.Collections.QuestList = Backbone.Collection.extend({
        model: QuestCategory,
        url: 'quest.list',
        initialize: function() {
            this.on('error', this.error, this);
        },
        error: function() {
            Backbone.history.navigate('login', {trigger: true});
        },
        parse: function(response) {
            App.cache['quests'] = response.items;
            return _.groupBy(response.items, function(obj) { return obj.section.id; });
        }
    });

    App.Views.QuestList = Backbone.View.extend({
        initialize: function() {
            this.collection = new App.Collections.QuestList();

            this.listenTo(this.collection, "add", this.render);

            Backbone.Events.on('quest:update', this.update, this);

            this.update();
        },
        events: {
            'click a.quest_title': "openModal",
        },

        update: function() {
            this.collection.fetch();
        },

        openModal: function (e) {
            var quest = _.find(App.cache['quests'], function(num){ return num.id == e.target.id; });

            (new App.Models.QuestTake).fetch({ params: { id: quest.id }});

            App.Views.Main.$el.find('.modal-content').html((new Task).render(quest).$el);
        },
        render: function (array) {
            // Sort by rating
            array.attributes = _.map(array.attributes, function(section) {
                return _.sortBy(section, function(item) { return item.score; });
            });
            // Список категорий в квестах
            sections = _.map(array.attributes, function(num, key){ return { id: key, title: num[0].section.title }} );
            this.$el.html(new EJS({url: 'templates/quest/QuestList.ejs'}).render({ sections: sections, arr: array.attributes }));

            return this;
        }

    });

    var Task = Backbone.View.extend({
        events: {
            'click button.answer': 'checkAnswer'
        },
        checkAnswer: function(e) {
            this.$el.find('.alert').hide();
            var Pass = new App.Models.QuestPass();
            Pass.fetch({params: {id: this.quest.id, answer: this.$el.find('#answer').val() }});


        },
        render: function(quest) {
            this.quest = quest;
            this.$el.html(new EJS({url: 'templates/quest/Modal.ejs'}).render(quest));
            return this;
        }
    });

    App.Models.QuestTake = Backbone.Model.extend({
        url: 'quest.take',
        parse: function(response) {
            console.log(response);
        }
    });

    App.Models.QuestPass = Backbone.Model.extend({
        url: 'quest.pass',
        initialize: function() {
            this.listenTo(this, 'error', this.showError);
        },

        showError: function(model) {
            var message = '';
            if(typeof model.message == 'object') {
                for (var item in model.message) {
                    for(var i in model.message[item]) {
                        message += model.message[item][i] + '\n';
                    }
                }
                $('.modal .alert-danger').text(message).show();
            }
            else 
                $('.modal .alert-danger').text(model.message).show();
        },

        parse: function (response) {
            // Answer is not correct
            if (!response) {
                $('.modal .alert-danger').text('Ответ неверен').show();
                return true;
            }

            $('.modal .alert-success').show();

            Backbone.Events.trigger('quest:update');

            Backbone.Events.trigger('users:update');
        }
    });

    // Список пользователей

    App.Models.User = Backbone.Model.extend({
        parse: function(response) {
            return response
        }
    });

    App.Collections.Users = Backbone.Collection.extend({
        model: App.Models.User,
        url: 'user.list',
        parse: function(response) {
            return {
                response: response.items
            };
        }
    });

    App.Views.UserList = Backbone.View.extend({
        events: {
            'click .logout': 'logout',
            'click .news': 'news',
            'click .rating': 'rating'
        },

        initialize: function() {
            this.collection = new App.Collections.Users();

            this.listenTo(this.collection, "add", this.render);
            Backbone.Events.on('users:update', this.update, this);

            this.update();
        },

        logout: function() {
            console.log('logout');
            Backbone.history.navigate('logout', {trigger: true});
        },

        news: function() {
            this.$el.find('.block').hide();
            this.$el.find('.block-news').show();
        },

        rating: function () {
            this.$el.find('.block').hide();
            this.$el.find('.block-rating').show();
        },

        update: function() {
            this.collection.fetch({ params: { order: 'rating' }});
        },

        updateNews: function () {
            this.$el.find('#vk_groups').empty();
            if(typeof VK !== "undefined") {
                VK.Widgets.Group("vk_groups", {
                    mode: 2,
                    width: "225",
                    height: "570",
                    color1: 'FFFFFF',
                    color2: '2B587A',
                    color3: '#5cb85c'
                }, 101763977);
            }
            else {
                console.log('VK is not defined');
                console.log(this.$el.find('#vk_groups'));
                this.$el.find('#vk_groups').html('У вас заблокирован доступ к сайту ВКонтакте, для просмотра новостей разблокируйте его.')
            }
        },

        render: function (array) {
            this.$el.html(new EJS({url: 'templates/quest/UserList.ejs'}).render({
                myRole: App.cache.role,
                user: array.attributes.response
            }));

            this.updateNews();
            var self = this;
            clearInterval(App.VK);

            if(typeof VK !== 'undefined') {
                App.VK = setInterval(function () {
                    self.updateNews();
                }, 60000);
            }
            return this;
        }

    });

    // Конец списка пользователей

    App.Models.Auth = Backbone.Model.extend({
        initialize: function () {
            this.on('sync', this.setCookie, this);
            this.on('error', this.error, this);
        },

        url: '../token',

        setCookie: function (model, params) {
            var dayDiff = new Date(params.expires_in*1000) - new Date();
            dayDiff = dayDiff / (24*3600*1000);

            $.cookie('token', params.access_token, { expires: parseInt(dayDiff) });
            $.cookie('user_id', params.user_id, { expires: parseInt(dayDiff) });

            // Сохраняем роль пользоватлея
            App.cache.role = params.role;

            Backbone.history.navigate('timer', {trigger: true});
        },

        error: function (code) {
            this.trigger('message', code.message);
        }
    });

    App.Models.Signup = Backbone.Model.extend({
        initialize: function (params, test) {
            this.on('all', this.all);
            this.on('sync', this.login, this);
            this.on('error', this.error, this);
        },

        url: 'auth.signup',

        all: function (method, params, test) {
            console.log(method, params, test);
        },

        login: function (model, params) {
            console.log(params);

            var auth = new App.Models.Auth;

            auth.fetch({ params: {
                client_id: App.config.client_id,
                username: this.params.nick,
                password: this.params.password
            }});

            return true;
        },

        error: function (code) {
            var messages = _.values(code.message).join('\n');
            this.trigger('message', messages);
        }
    });


    App.Views.Login = Backbone.View.extend({
        id: 'container',

        events: {
            'click button#submit': "submit",

            'click button#button-signup': 'signupForm',
            'click button#button-login': 'loginForm',
        },

        initialize: function () {
            this.on('sync', this.setCookie, this);
            App.Views.Main.render(this.render().$el);
        },

        signupForm: function() {
            this.$el.find('.message').hide();
            this.$el.find('.form-login').hide();

            this.$el.find('.form-signup').show();
        },

        loginForm: function() {
            this.$el.find('.message').hide();
            this.$el.find('.form-login').show();

            this.$el.find('.form-signup').hide();
        },

        submitSignup: function() {
            var signup = new App.Models.Signup;
            var params = {
                mail: this.$el.find('#inputSignupEmail').val(),
                nick: this.$el.find('#inputSignupLogin').val(),
                university: this.$el.find('#inputSignupUniversity').val(),
                password: this.$el.find('#inputSignupPassword').val()
            };

            if (params.nick == "") {
                this.message("Не введен логин");
                return false;
            }

            if (params.password == "") {
                this.message("Не введен пароль");
                return false;
            }

            if (params.university == "") {
                this.message("Не введен вуз");
                return false;
            }

            if (params.mail == "") {
                this.message("Не введен электронный адрес");
                return false;
            }
            console.log('SIGNUP');
            signup.params = params;
            signup.on('message', this.message, this);

            signup.fetch({ params: params });
            return false;
        },

        submitLogin: function() {
            console.log('submitLogin');
            var auth = new App.Models.Auth;
            var params = {
                client_id: App.config.client_id,
                username: this.$el.find('#inputEmail').val(),
                password: this.$el.find('#inputPassword').val()
            };

            if (params.username == "") {
                this.message("Не введен логин");
                return false;
            }

            if (params.password == "") {
                this.message("Не введен пароль");
                return false;
            }

            auth.fetch({ params: params });

            auth.on('message', this.message, this);
            return false;
        },

        submit: function (el) {
            el.preventDefault();
            var type = $(el.target).data('type');
            
            return type == 'login' ? this.submitLogin() : this.submitSignup();
        },

        message: function(text) {
            console.log(text);
            this.$el.find('.message').show().html(text);
        },

        render: function() {
            this.$el.html(new EJS({url: 'templates/login.ejs'}).render());

            return this;
        }
    });

    new App.Router();
    // Проверим вошел ли пользователь
    if (!$.cookie('token') || !$.cookie('user_id')) {
        Backbone.history.navigate('login', {trigger: true});
    }
    else {
        console.log('navigate timer');
        // А соревнования начались???
        Backbone.history.navigate('timer');
    }


    App.Events.on('start_game', function() {
        // Выключаем старый таймер
        clearTimeout(App.cache['timerStart']);
        console.log('on: start_game');
        App.Events.trigger('start:finish')
    });

    App.Events.on('end_game', function() {
        console.log('игра закончилась');
        // Выключаем старый таймер
        clearTimeout(App.cache['timerEnd']);

        //Timer.trigger('start:timer:end')
        Backbone.history.navigate('end', {trigger: true});
    });



});

