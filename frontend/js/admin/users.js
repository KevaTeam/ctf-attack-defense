define(['jquery', 'underscore', 'backbone', 'wrapper', 'bootstrap'], function($, _, Backbone, wrapper) {

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

    return Backbone.View.extend({
        el: '.container',

        events: {
            'click .user-add': 'showAddUserForm',
            'click .form-submit': 'addUserQuery',
            'click .edit-form': 'showFormWithEdit'
        },

        initialize: function() {
            wrapper.updateMenu('users');

            var html = new EJS({url: 'templates/admin/users/main.ejs'}).text;

            wrapper.renderPage(html);

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
});