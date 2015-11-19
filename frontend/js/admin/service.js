define(['jquery', 'underscore', 'backbone', 'wrapper', 'bootstrap'], function($, _, Backbone, wrapper) {

    // Services
    App.Models.Service = Backbone.Model.extend({
        defaults: {
            id: 0,
            name: '',
            timeout: '0',
            program: '',
            type: 'add'
        },

        parse: function(response) {
            response.type = 'edit';
            return response;
        }
    });

    App.Collections.ListService = Backbone.Collection.extend({
        url: 'service.list',

        model: App.Models.Service,

        parse: function(response) {
            return response.items;
        }
    });

    App.Views.ServiceForm = Backbone.View.extend({
        events: {
            'click .btn-success': 'submit'
        },

        initialize: function() {
            this.template = _.template($('#service-form-template').html());
        },

        submit: function() {
            App.Events.trigger('services:form:parse');
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.ServiceList = Backbone.View.extend({
        tagName: 'tr',

        events: {
            'click .edit-service': 'showEditForm',
            'click .delete-service': 'deleteForm'
        },

        initialize: function() {
            this.template = _.template($('#service-template').html());
        },

        showEditForm: function(el) {
            App.Events.trigger('services:block:edit:show', $(el.currentTarget).data('id'));
        },

        deleteForm: function(el) {
            App.Events.trigger('services:modal:confirm:show', $(el.currentTarget).data('id'));
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });
    return Backbone.View.extend({
        el: '.container',

        events: {
            'click .service-add': 'showForm'
        },

        initialize: function() {
            wrapper.updateMenu('service');

            var html = new EJS({url: 'templates/admin/services/main.ejs'}).text;

            wrapper.renderPage(html);

            this.blocks = {
                services: this.$el.find('#service-list'),
                form: this.$el.find('#service-form')
            };
            // Список категорий сервиса
            this.sections = [];

            this.collections = {};
            this.collections.Services = new App.Collections.ListService();



            this.collections.Services.fetch();

            this.listenTo(this.collections.Services, 'sync', this.updateCount);
            this.listenTo(this.collections.Services, 'add', this.addOneService);
            this.listenTo(this.collections.Services, 'change', this.updateOneService);

            App.Events.on('services:block:edit:show', this.showForm, this);
            App.Events.on('services:modal:confirm:show', this.showDeleteWindow, this);
            App.Events.on('services:form:parse', this.formParse, this);
            App.Events.on('services:form:message:show', this.showFormMessage, this);
        },

        showForm: function(id) {
            console.log(id);
            if(typeof(id) == 'object') {
                var model = new App.Models.Service();
            }
            else {
                var model = this.collections.Services.get(id);
            }
            // Добавляем список категорий
            model.attributes.listSection = this.sections;

            var view = new App.Views.ServiceForm({ model: model });

            this.blocks.form.html(view.render().el);
        },

        updateOneService: function(user) {
            var view = new App.Views.ServiceList({ id: 'service-'+user.get('id'), model: user});

            this.$el.find('#service-'+user.get('id')).replaceWith(view.render().el);
        },

        formParse: function() {
            var params = {
                    id: this.$el.find('#inputId').val(),
                    name: this.$el.find('#inputName').val(),
                    timeout: this.$el.find('#inputTimeout').val(),
                    program: this.$el.find('#inputProgram').val()
                },
                self = this,
                type = this.$el.find('#inputType').val();

            var model = Backbone.Model.extend({
                url: (type == 'add' ? 'service.create':'service.save'),

                parse: function(response){
                    self.$el.find('#service-form').html('');
                    self.collections.Services.fetch();
                }
            });

            model = new model();
            model.fetch({ params: params });

            this.listenTo(model, 'error', function(response) {
                App.Events.trigger('services:form:message:show', response.message);
            });
        },

        addOneSection: function(model) {
            this.sections.push(model.toJSON());
        },

        showDeleteWindow: function(serviceId) {
            var model = Backbone.Model.extend({}),
                self = this;

            var modal = new App.Views.Modal({ model: new model({ 'serviceId': serviceId })});

            var modalWindow = this.$el.find('.modalWindow').html(modal.render().el).find('.modal');
            modalWindow.modal('show');
            console.log(self.collections.Services);
            this.listenTo(modal, 'submit', function() {
                var model = Backbone.Model.extend({
                    url: 'service.delete',
                    parse: function(response){
                        var c = self.collections.Services.get(serviceId);
                        self.collections.Services.remove(c);
                        console.log(self.collections.Services);
                        self.updateCount(self.collections.Services);
                        self.$el.find('#service-'+serviceId).remove();
                        modalWindow.modal('hide');
                    }
                });

                model = new model();
                model.fetch({ params: { id: serviceId } });
                self.listenTo(model, 'error', function(response) {
                    alert('Error! ' + response.message);
                });
            });
        },

        showFormMessage: function(text) {
            this.$el.find('.form-message').show().text(App.Functions.Message(text));
        },

        addOneService: function(model) {
            var view = new App.Views.ServiceList({ id: 'service-'+model.get('id'), model: model});

            this.blocks.services.append(view.render().el);
        },

        updateCount: function (items) {
            var count_user = rulesRus(items.length, ['сервис', 'сервиса', 'сервисов']);
            this.$el.find('.count_service').text(count_user);
        },
    });

})
