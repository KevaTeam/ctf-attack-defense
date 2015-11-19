/**
 * Created by Дмитрий on 04.01.2015.
 */
define(function(require) {
    var App = {
        Router: {},
        Models: {},
        Collections: {},
        Views: {},
        Events: Backbone.Events
    };

    var app = {
        config: {
            urlAPI: "http://localhost/index.php/method",
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
                var code = { message: resp.description };
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

    App.Router = Backbone.Router.extend({
        initialize: function() {
            console.log('okey, router');
            App.Views.Wrapper = new App.Views.MainPage();
            Backbone.history.start();
            console.log(this);
        },

        routes: {
            '': 'index',
            'index': 'index',
            'users': 'users',
            'users/:id': 'users',
            'quest': 'quest',
            'config': 'config',
        },
     
        index: function() {
            var html = new EJS({url: 'templates/admin/monitor/main.ejs'}).text;

            App.Views.Wrapper.renderPage(html);

            new App.Views.Monitor();
        },
        users: function() {
            new App.Views.Users();
        },
        quest: function() {
            new App.Views.Quests();
        },
        config: function() {
            new App.Views.Config();
        }
    });


    App.Views.MainPage = Backbone.View.extend({
        el: $('.wrapper'),

        // Делаем глобальный шаблон
        initialize: function() {
            var html = new EJS({url: 'templates/admin/main.ejs'}).text;

            this.$el.html(html);
        },

        updateMenu: function(item) {
            this.$el.find('.menu li').removeClass('active');
            this.$el.find('.menu .item_'+item).addClass('active');
        },
        renderPage: function(html) {
            App.Events.trigger('page:update');
            this.$el.find('#page').html(html);
        }
    });





    // model and collection for monitor last answers
    App.Models.LastAnswers = Backbone.Model.extend({
        parse: function(response) {
            //console.log(response);
            return response;
        }
    });

    App.Collections.ListLastAnswers = Backbone.Collection.extend({
        url: 'quest.getAttempts',

        model: App.Models.LastAnswers,

        parse: function(response) {
            return _.map(response, function(num, key) {
                // Делаем нумерацию рейтинга
                num['id'] = num['user']+'_'+num['quest']['id']+'_'+num['time'];
                return num;
            });
        }
    });

    // model and collection for user rating
    App.Models.UserRating = Backbone.Model.extend({
        initialize: function() {
            //console.log('Model UserRating is running');
        },
        parse: function(response) {
            return response;
        }
    });

    App.Collections.ListUserRating = Backbone.Collection.extend({
        url: 'user.list',

        model: App.Models.UserRating,

        parse: function(response) {
            return _.map(response.items, function(num, key) {
                // Делаем нумерацию рейтинга
                num['position'] = key + 1;
                return num;
            });
        }
    });

    App.Views.MonitorAnswers = Backbone.View.extend({
        tagName: 'tr',

        initialize: function() {
            this.template = _.template($('#list-answers-template').html());
        },

        render: function() {
            this.$el.addClass((this.model.get('user_answer') == this.model.get('real_answer')) ? 'success' : 'danger');
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.MonitorRating = Backbone.View.extend({
        tagName: 'tr',

        initialize: function() {
            this.template = _.template($('#user-rating-template').html());
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.Monitor = Backbone.View.extend({
        initialize: function() {
            this.el = $('.container');
            App.Views.Wrapper.updateMenu('index');

            this.rating = this.el.find("#monitor-user-rating");
            this.answers = this.el.find("#monitor-list-answers");

            var Rating = new App.Collections.ListUserRating();
            var LastAnswers = new App.Collections.ListLastAnswers();

            this.listenTo(Rating, 'add', this.addOneRating);
            this.listenTo(Rating, 'sort', this.sortRating);
            this.listenTo(LastAnswers, 'add', this.addOneAnswer);

            // Обновление информации
            Rating.fetch({params: { order: 'rating' } });
            this.timerRating = setInterval(function() { Rating.fetch({params: { order: 'rating' } }) }, 15000);

            LastAnswers.fetch();
            this.timerLastAnswer = setInterval(function() { LastAnswers.fetch() }, 15000);

            // обнуляем обновление таймеров
            var self = this;
            App.Events.on('page:update', function() {
                self.destructTimer();
            });
        },

        destructTimer: function() {
            clearInterval(this.timerRating);
            clearInterval(this.timerLastAnswer);
        },
        // For debug
        tryCatch: function (str) {
           console.log(str);
        },
        addOneRating: function(rating) {
            var view = new App.Views.MonitorRating({model: rating, id: 'rating-user-'+rating.get('id')});

            this.rating.append(view.render().el);
        },

        sortRating: function(collection) {
            this.rating.empty();

            var self = this;
            collection.each(function(rating) {
                self.addOneRating(rating);
            });
        },

        addOneAnswer: function(answer) {
            var view = new App.Views.MonitorAnswers({model: answer});
            this.answers.prepend(view.render().el);
        }
    });

    App.Models.CurrentTime = Backbone.Model.extend({
        url: 'timer.current',

        parse: function(data) {
            return data;
        }
    });

    App.Models.dataSetting = Backbone.Model.extend({
        initialize: function(method) {
            this.setMethod(method);
        },
        url: 'settings.get',

        setMethod: function(method) {
            this.method = (method == 'get' ? 'get' : 'set');
            this.url = 'settings.' + this.method;
        }

    });


    App.Views.Config = Backbone.View.extend({
        el: '.container',
        template: new EJS({url: 'templates/admin/config/main.ejs'}).text,
        events: {
            "click .submit-datetime": 'changeDate'
        },
        changeDate: function() {
            this.$el.find('.success-message').hide();
            var date = new App.Models.dataSetting('set');
            date.fetch({ params: { key: 'datetime_start', value: this.$el.find('#date_start input').val() } });
            date.fetch({ params: { key: 'datetime_end', value: this.$el.find('#date_end input').val() } });
            
            var self = this;

            this.listenTo(date, 'sync', function() {
                self.$el.find('.success-message').show();
            });
        },

        setDate: function(data) {
            $('#'+data.get('k')).datetimepicker({
                defaultDate: moment(data.get('value')),
                locale: 'ru'
            });
        },

        setCurrentTime: function(data) {
            var self = this;
            
            setInterval(function() {
                var date = moment(data.get('time')*1000).format('D MMMM YYYY, hh:mm:ss');
                self.$el.find('.current-time').text(date);

                data.set({ 'time': data.get('time') + 1 });
            }, 1000);

            var date = moment(data.get('time')*1000).format('D MMMM YYYY, hh:mm:ss');
            
            this.$el.find('.current-time').text(date);
        },

        initialize: function() {
            App.Views.Wrapper.updateMenu('config');

            App.Views.Wrapper.renderPage(this.template);

            this.currentTime = new App.Models.CurrentTime();
            this.date = new App.Models.dataSetting('get');

            this.listenTo(this.currentTime, 'sync', this.setCurrentTime);
            this.listenTo(this.date, 'sync', this.setDate);

            this.currentTime.fetch();
            this.date.fetch({ params: { key: 'datetime_start' }});
            this.date.fetch({ params: { key: 'datetime_end' }});

            moment.locale('ru');
        }
    });

    // Users
    App.Models.User = Backbone.Model.extend({
        defaults: {
            "id": 0,
            "type": "add",
            "nick": "",
            "role": "1",
            "mail": ""
        },

        parse: function(response) {
            response['type'] = 'edit';
            return response;
        }
    });

    App.Collections.ListUsers = Backbone.Collection.extend({
        url: 'user.list',

        model: App.Models.User,

        parse: function(response) {
            return response.items;
        }
    });

    App.Views.UsersList = Backbone.View.extend({
        tagName: 'tr',

        events: {
            'click .user_info': 'showUserInfo',
            'click .edit_info': 'showEditForm',
            'click .delete_user': 'showConfirmModal'
        },

        initialize: function() {
            this.template = _.template($('#user-template').html());
        },
        // Обработка нажатия кнопки информация
        showUserInfo: function(el) {
            App.Events.trigger('users:block:info:show', el);
        },
        // Обработка нажатия кнопки редактировать
        showEditForm: function(el) {
            App.Events.trigger('users:form:edit:show', el);
        },
        // Обработка нажатия кнопки удалить
        showConfirmModal: function(el) {
            App.Events.trigger('users:modal:confirm:show', $(el.currentTarget).data('id'));
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Models.UserInfo = Backbone.Model.extend({
        url: 'user.get',

        parse: function(response) {
            return response;
        }
    });

    App.Views.UserInfo = Backbone.View.extend({
        initialize: function() {
            this.template = _.template($('#user-info-template').html());
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.UserForm = Backbone.View.extend({
        initialize: function() {
            this.template = _.template($('#user-form-template').html());
        },

        show: function() {
            this.$el.show();
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.Users = Backbone.View.extend({
        el: '.container',

        events: {
            'click .user-add': 'showAddUserForm',
            'click .form-submit': 'addUserQuery',
            'click .edit-form': 'showFormWithEdit'
        },

        initialize: function() {
            App.Views.Wrapper.updateMenu('users');

            var html = new EJS({url: 'templates/admin/users/main.ejs'}).text;

            App.Views.Wrapper.renderPage(html);

            this.block = {
                users: this.$el.find("#users-list"),
                info: this.$el.find('.userInfoForm'),
                form: this.$el.find('.inputUserForm')
            };

            this.collection = {};
            this.collection.Users = new App.Collections.ListUsers();

            // Получаем количество пользователей
            this.listenTo(this.collection.Users, 'sync', this.updateCount);
            this.listenTo(this.collection.Users, 'add', this.addOneUser);
            this.listenTo(this.collection.Users, 'remove', this.removeOneUser);
            this.listenTo(this.collection.Users, 'change', this.updateOneUser);

            // Обновление информации
            this.collection.Users.fetch();
            //this.timerUsersList = setInterval(function() { Users.fetch() }, 60000);

            //LastAnswers.fetch();
            //this.timerLastAnswer = setInterval(function() { LastAnswers.fetch() }, 15000);

            // обнуляем обновление таймеров
            App.Events.on('page:update', this.destructTimer(), this);

            App.Events.on('users:block:info:show', this.showUserInfo, this);
            App.Events.on('users:form:edit:show', this.showFormWithEdit, this);
            App.Events.on('users:modal:confirm:show', this.showConfirmModal, this);
            App.Events.on('users:form:message:show', this.showFormMessage, this);
        },

        updateCount: function (items) {
            var count_user = rulesRus(items.length, ['пользователь', 'пользователя', 'пользователей']);
            this.$el.find('.count_user').text(count_user);
        },

        showUserInfo: function(el) {
            var UserInfo = new App.Models.UserInfo();

            this.listenTo(UserInfo, 'change', function(model) {
                var info = new App.Views.UserInfo({ model: model });

                this.$el.find('.sidebar').hide();
                this.block.info.show().html(info.render().el);
            });

            UserInfo.fetch({ params: { id: $(el.currentTarget).data('id') } });
        },

        tryCatch: function(str) {
            console.log(str);
        },

        updateOneUser: function(user) {
            var view = new App.Views.UsersList({ id: 'user-'+user.get('id'), model: user});

            this.block.users.find('#user-'+user.get('id')).replaceWith(view.render().el);
        },
        // Показываем форму
        showUserForm: function(html) {
            this.$el.find('.sidebar').hide();
            this.block.form.html(html).show();
        },

        showAddUserForm: function() {
            var form = new App.Views.UserForm({ model: new App.Models.User() });
            this.showUserForm(form.render().el);
        },

        showFormWithEdit: function(el) {
            var model = this.collection.Users.get($(el.currentTarget).data('id'));

            var form = new App.Views.UserForm({ model: model });
            this.showUserForm(form.render().el);
        },

        showConfirmModal: function(userId) {
            var model = Backbone.Model.extend({}),
                self = this;

            var modal = new App.Views.Modal({ model: new model({ 'userId': userId })});

            var modalWindow = this.$el.find('.modalWindow').html(modal.render().el).find('.modal');
            modalWindow.modal('show');

            this.listenTo(modal, 'submit', function() {
                var model = Backbone.Model.extend({
                    url: 'user.delete',
                    parse: function(response){
                        var c = self.collection.Users.get(userId);
                        self.collection.Users.remove(c);
                        modalWindow.modal('hide');
                    }
                });

                model = new model();
                model.fetch({ params: { id: userId } });
                self.listenTo(model, 'error', function(response) {
                    alert('Error! ' + response.message);
                });
            });
        },

        showFormMessage: function(text) {
            this.$el.find('.form-message').show().text(text);
        },

        addOneUser: function(user) {
            var view = new App.Views.UsersList({ id: 'user-'+user.get('id'), model: user});

            this.block.users.append(view.render().el);
        },

        removeOneUser: function(user) {
            this.block.users.find('#user-'+user.id).remove();
            this.updateCount(this.$el.find('#users-list tr'));
            return true;
        },
        // Добавление пользователя
        addUserQuery: function() {
            var params = {
                    password: this.$el.find('#inputPassword').val(),
                    nick: this.$el.find('#inputNick').val(),
                    mail: this.$el.find('#inputMail').val(),
                    role: this.$el.find('#inputRole').val(),
                    id: this.$el.find('#inputId').val()
                },
                self = this,
                type = this.$el.find('#inputType').val();

            var model = Backbone.Model.extend({
                url: (type == 'add' ? 'auth.signup':'user.edit'),

                parse: function(response){
                    self.listenToOnce(self.collection.Users, (type == 'add' ? 'add':'change'), function(model) {
                        var info = new App.Views.UserInfo({ model: model });

                        self.$el.find('.sidebar').hide();
                        self.$el.find('.userInfoForm').show();

                        self.block.info.html(info.render().el);
                    });
                    self.collection.Users.fetch();
                 }
            });

            model = new model();
            model.fetch({ params: params });

            this.listenTo(model, 'error', function(response) {
                App.Events.trigger('users:form:message:show', response.message);
            });

        },
        destructTimer: function() {
            clearInterval(this.timerUsersList);
            //clearInterval(this.timerLastAnswer);
        }
    });



    // Quests
    App.Models.Quest = Backbone.Model.extend({
        defaults: {
            id: 0,
            title: '',
            score: '',
            short_text: '',
            full_text: '',
            answer: '',
            type: 'add',
            section: {
                id: '0',
                title: ''
            }
        },

        parse: function(response) {
            response.type = 'edit';
            return response;
        }
    });

    App.Collections.ListQuest = Backbone.Collection.extend({
        url: 'quest.list',

        model: App.Models.Quest,

        parse: function(response) {
            return response.items;
        }
    });

    App.Models.QuestSection = Backbone.Model.extend({
        parse: function(response) {
            return response;
        }
    });

    App.Collections.ListSection = Backbone.Collection.extend({
        url: 'quest.listSection',

        model: App.Models.QuestSection,

        parse: function(response) {
            return response.items;
        }
    });

    App.Views.QuestForm = Backbone.View.extend({
        events: {
            'click .btn-success': 'submit'
        },

        initialize: function() {
            this.template = _.template($('#quest-form-template').html());
        },

        submit: function() {
            App.Events.trigger('quests:form:parse');
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.QuestList = Backbone.View.extend({
        tagName: 'tr',

        events: {
            'click .edit-quest': 'showEditForm',
            'click .delete-quest': 'deleteForm'
        },

        initialize: function() {
            this.template = _.template($('#quest-template').html());
        },

        showEditForm: function(el) {
            App.Events.trigger('quests:block:edit:show', $(el.currentTarget).data('id'));
        },

        deleteForm: function(el) {
            App.Events.trigger('quests:modal:confirm:show', $(el.currentTarget).data('id'));
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    App.Views.Quests = Backbone.View.extend({
        el: '.container',

        events: {
            'click .quest-add': 'showForm'
        },

        initialize: function() {
            App.Views.Wrapper.updateMenu('quest');

            var html = new EJS({url: 'templates/admin/quests/main.ejs'}).text;

            App.Views.Wrapper.renderPage(html);

            this.blocks = {
                quests: this.$el.find('#quest-list'),
                form: this.$el.find('#quest-form')
            };
            // Список категорий квеста
            this.sections = [];

            this.collections = {};
            this.collections.Quests = new App.Collections.ListQuest();
            this.collections.Sections = new App.Collections.ListSection();


            this.collections.Quests.fetch();

            this.collections.Sections.fetch();
            this.listenTo(this.collections.Quests, 'sync', this.updateCount);
            this.listenTo(this.collections.Quests, 'add', this.addOneQuest);
            this.listenTo(this.collections.Quests, 'change', this.updateOneQuest);

            this.listenTo(this.collections.Sections, 'add', this.addOneSection);

            App.Events.on('quests:block:edit:show', this.showForm, this);
            App.Events.on('quests:modal:confirm:show', this.showDeleteWindow, this);
            App.Events.on('quests:form:parse', this.formParse, this);
            App.Events.on('quests:form:message:show', this.showFormMessage, this);
        },

        showForm: function(id) {
            if(typeof(id) == 'object') {
                var model = new App.Models.Quest();
            }
            else {
                var model = this.collections.Quests.get(id);
            }
            // Добавляем список категорий
            model.attributes.listSection = this.sections;

            var view = new App.Views.QuestForm({ model: model });

            this.blocks.form.html(view.render().el);
        },

        updateOneQuest: function(user) {
            var view = new App.Views.QuestList({ id: 'quest-'+user.get('id'), model: user});

            this.$el.find('#quest-'+user.get('id')).replaceWith(view.render().el);
        },

        formParse: function() {
            var params = {
                    id: this.$el.find('#inputId').val(),
                    title: this.$el.find('#inputName').val(),
                    section: this.$el.find('#inputSection').val(),
                    score: this.$el.find('#inputScore').val(),
                    answer: this.$el.find('#inputAnswer').val(),
                    short_text: this.$el.find('#inputShortDescription').val(),
                    full_text: this.$el.find('#inputDescription').val()
                },
                self = this,
                type = this.$el.find('#inputType').val();

            var model = Backbone.Model.extend({
                url: (type == 'add' ? 'quest.create':'quest.save'),

                parse: function(response){
                    self.$el.find('#quest-form').html('');
                    self.collections.Quests.fetch();
                }
            });

            model = new model();
            model.fetch({ params: params });

            this.listenTo(model, 'error', function(response) {
                App.Events.trigger('quests:form:message:show', response.message);
            });
        },

        addOneSection: function(model) {
            this.sections.push(model.toJSON());
        },

        showDeleteWindow: function(questId) {
            var model = Backbone.Model.extend({}),
                self = this;

            var modal = new App.Views.Modal({ model: new model({ 'questId': questId })});

            var modalWindow = this.$el.find('.modalWindow').html(modal.render().el).find('.modal');
            modalWindow.modal('show');

            this.listenTo(modal, 'submit', function() {
                var model = Backbone.Model.extend({
                    url: 'quest.delete',
                    parse: function(response){
                        var c = self.collections.Quests.get(questId);
                        self.collections.Quests.remove(c);

                        self.$el.find('#quest-'+questId).remove();
                        modalWindow.modal('hide');
                    }
                });

                model = new model();
                model.fetch({ params: { id: questId } });
                self.listenTo(model, 'error', function(response) {
                    alert('Error! ' + response.message);
                });
            });
        },

        showFormMessage: function(text) {
            this.$el.find('.form-message').show().text(text);
        },

        addOneQuest: function(model) {
            var view = new App.Views.QuestList({ id: 'quest-'+model.get('id'), model: model});

            this.blocks.quests.append(view.render().el);
        },

        updateCount: function (items) {
            var count_user = rulesRus(items.length, ['сервис', 'сервиса', 'сервисов']);
            this.$el.find('.count_quest').text(count_user);
        },
    });

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



    // Инициализация роутинга
    new App.Router();
});