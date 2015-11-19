define(['jquery', 'underscore', 'backbone', 'wrapper', 'bootstrap'], function($, _, Backbone, wrapper) {

    // Teams
    App.Models.Team = Backbone.Model.extend({
        defaults: {
            id: 0,
            nick: '',
            logo: '',
            host: '',
            rating: '',
            type: 'add'

        },

        parse: function(response) {
            response.type = 'edit';
            return response;
        }
    });

    App.Collections.ListTeam = Backbone.Collection.extend({
        url: 'teams.list',

        model: App.Models.Team,

        parse: function(response) {
            return response.items;
        }
    });

    App.Views.TeamForm = Backbone.View.extend({
        events: {
            'click .btn-success': 'submit'
        },

        initialize: function() {
            this.template = _.template($('#team-form-template').html());
        },

        submit: function() {
            App.Events.trigger('teams:form:parse');
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.TeamList = Backbone.View.extend({
        tagName: 'tr',

        events: {
            'click .edit-team': 'showEditForm',
            'click .delete-team': 'deleteForm'
        },

        initialize: function() {
            this.template = _.template($('#team-template').html());
        },

        showEditForm: function(el) {
            App.Events.trigger('teams:block:edit:show', $(el.currentTarget).data('id'));
        },

        deleteForm: function(el) {
            App.Events.trigger('teams:modal:confirm:show', $(el.currentTarget).data('id'));
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });
    return Backbone.View.extend({
        el: '.container',

        events: {
            'click .team-add': 'showForm'
        },

        initialize: function() {
            wrapper.updateMenu('team');

            var html = new EJS({url: 'templates/admin/teams/main.ejs'}).text;

            wrapper.renderPage(html);

            this.blocks = {
                teams: this.$el.find('#team-list'),
                form: this.$el.find('#team-form')
            };
            // Список категорий сервиса
            this.sections = [];

            this.collections = {};
            this.collections.Teams = new App.Collections.ListTeam();



            this.collections.Teams.fetch();

            this.listenTo(this.collections.Teams, 'sync', this.updateCount);
            this.listenTo(this.collections.Teams, 'add', this.addOneTeam);
            this.listenTo(this.collections.Teams, 'change', this.updateOneTeam);

            App.Events.on('teams:block:edit:show', this.showForm, this);
            App.Events.on('teams:modal:confirm:show', this.showDeleteWindow, this);
            App.Events.on('teams:form:parse', this.formParse, this);
            App.Events.on('teams:form:message:show', this.showFormMessage, this);
        },

        showForm: function(id) {
            console.log(id);
            if(typeof(id) == 'object') {
                var model = new App.Models.Team();
            }
            else {
                var model = this.collections.Teams.get(id);
            }
            // Добавляем список категорий
            model.attributes.listSection = this.sections;

            var view = new App.Views.TeamForm({ model: model });

            this.blocks.form.html(view.render().el);
        },

        updateOneTeam: function(user) {
            var view = new App.Views.TeamList({ id: 'team-'+user.get('id'), model: user});

            this.$el.find('#team-'+user.get('id')).replaceWith(view.render().el);
        },

        formParse: function() {
            var params = {
                    id: this.$el.find('#inputId').val(),
                    nick: this.$el.find('#inputNick').val(),
                    logo: this.$el.find('#inputLogo').val(),
                    host: this.$el.find('#inputHost').val(),
                    rating: this.$el.find('#inputRating').val()
                },
                self = this,
                type = this.$el.find('#inputType').val();

            var model = Backbone.Model.extend({
                url: (type == 'add' ? 'teams.create':'teams.save'),

                parse: function(response){
                    self.$el.find('#teams-form').html('');
                    self.collections.Teams.fetch();
                }
            });

            model = new model();
            model.fetch({ params: params });

            this.listenTo(model, 'error', function(response) {
                App.Events.trigger('teams:form:message:show', response.message);
            });
        },

        addOneSection: function(model) {
            this.sections.push(model.toJSON());
        },

        showDeleteWindow: function(teamId) {
            var model = Backbone.Model.extend({}),
                self = this;

            var modal = new App.Views.Modal({ model: new model({ 'teamId': teamId })});

            var modalWindow = this.$el.find('.modalWindow').html(modal.render().el).find('.modal');
            modalWindow.modal('show');
            console.log(self.collections.Teams);
            this.listenTo(modal, 'submit', function() {
                var model = Backbone.Model.extend({
                    url: 'teams.delete',
                    parse: function(response){
                        var c = self.collections.Teams.get(teamId);
                        self.collections.Teams.remove(c);
                        console.log(self.collections.Teams);
                        self.updateCount(self.collections.Teams);
                        self.$el.find('#team-'+teamId).remove();
                        modalWindow.modal('hide');
                    }
                });

                model = new model();
                model.fetch({ params: { id: teamId } });
                self.listenTo(model, 'error', function(response) {
                    alert('Error! ' + response.message);
                });
            });
        },

        showFormMessage: function(text) {
            this.$el.find('.form-message').show().text(App.Functions.Message(text));
        },

        addOneTeam: function(model) {
            var view = new App.Views.TeamList({ id: 'team-'+model.get('id'), model: model});

            this.blocks.teams.append(view.render().el);
        },

        updateCount: function (items) {
            var count_user = rulesRus(items.length, ['команда', 'команды', 'команд']);
            this.$el.find('.count_team').text(count_user);
        },
    });

})