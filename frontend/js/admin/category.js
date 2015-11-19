define(['jquery', 'underscore', 'backbone', 'wrapper', 'bootstrap'], function($, _, Backbone, wrapper) {

        // Quests
    Category = Backbone.Model.extend({
        defaults: {
            id: 0,
            title: '',
            type: 'add'
        },

        parse: function(response) {
            response.type = 'edit';
            return response;
        }
    });

    collectionCategory = Backbone.Collection.extend({
        url: 'quest.listSection',

        model: Category,

        parse: function(response) {
            return response.items;
        }
    });

    Form = Backbone.View.extend({
        events: {
            'click .btn-success': 'submit'
        },

        initialize: function() {
            this.template = _.template($('#form-template').html());
        },

        submit: function() {
            App.Events.trigger('category:form:parse');
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    List = Backbone.View.extend({
        tagName: 'tr',

        events: {
            'click .edit': 'form',
            'click .delete': 'delete'
        },

        initialize: function() {
            this.template = _.template($('#quest-template').html());
        },

        form: function(el) {
            App.Events.trigger('category:block:edit:show', $(el.currentTarget).data('id'));
        },

        delete: function(el) {
            App.Events.trigger('category:modal:confirm:show', $(el.currentTarget).data('id'));
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return Backbone.View.extend({
        el: '.container',

        events: {
            'click .category-add': 'showForm'
        },

        initialize: function() {
            wrapper.updateMenu('category');

            var html = new EJS({url: 'templates/admin/category/main.ejs'}).text;

            wrapper.renderPage(html);

            this.blocks = {
                quests: this.$el.find('#quest-list'),
                form: this.$el.find('#quest-form')
            };
            // Список категорий квеста
            this.sections = [];

            this.collections = {};
            this.collections.Categories = new collectionCategory();

            this.collections.Categories.fetch();

            this.listenTo(this.collections.Categories, 'sync', this.updateCount);
            this.listenTo(this.collections.Categories, 'add', this.addOneCategory);
            this.listenTo(this.collections.Categories, 'change', this.updateElement);


            App.Events.on('category:block:edit:show', this.showForm, this);
            App.Events.on('category:modal:confirm:show', this.showDeleteWindow, this);
            App.Events.on('category:form:parse', this.formParse, this);
            App.Events.on('category:form:message:show', this.showFormMessage, this);
        },

        showForm: function(id) {
            if(typeof(id) == 'object') {
                var model = new Category();
            }
            else {
                var model = this.collections.Categories.get(id);
            }
            // Добавляем список категорий
            model.attributes.listSection = this.sections;

            var view = new Form({ model: model });

            this.blocks.form.html(view.render().el);
        },

        updateElement: function(user) {
            var view = new List({ id: 'quest-'+user.get('id'), model: user});

            this.$el.find('#quest-'+user.get('id')).replaceWith(view.render().el);
        },

        formParse: function() {
            var params = {
                    id: this.$el.find('#inputId').val(),
                    title: this.$el.find('#inputTitle').val()
                },
                self = this,
                type = this.$el.find('#inputType').val();

            var model = Backbone.Model.extend({
                url: (type == 'add' ? 'quest.addSection':'quest.editSection'),

                parse: function(response){
                    self.$el.find('#quest-form').html('');
                    self.collections.Categories.fetch();
                }
            });

            model = new model();
            model.fetch({ params: params });

            this.listenTo(model, 'error', function(response) {
                App.Events.trigger('category:form:message:show', response.message);
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
                    url: 'quest.deleteSection',
                    parse: function(response){
                        var c = self.collections.Categories.get(questId);
                        self.collections.Categories.remove(c);

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

        addOneCategory: function(model) {
            var view = new List({ id: 'quest-'+model.get('id'), model: model});

            this.blocks.quests.append(view.render().el);
        },

        updateCount: function (items) {
            var count_user = rulesRus(items.length, ['категория', 'категории', 'категорий']);
            this.$el.find('.count_quest').text(count_user);
        },
    });

});