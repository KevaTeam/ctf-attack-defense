define(['jquery', 'underscore', 'backbone', 'collections/rating', 'collections/answers', 'wrapper'], function($, _, Backbone) {
    console.log('module: monitor');
    monitorRating = Backbone.View.extend({
        tagName: 'tr',

        initialize: function() {
            this.template = _.template($('#user-rating-template').html());
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    monitorAnswers = Backbone.View.extend({
        tagName: 'tr',

        initialize: function() {
            this.template = _.template($('#list-answers-template').html());
        },

        render: function() {
            this.$el.addClass((this.model.get('user_answer').toLowerCase() == this.model.get('real_answer').toLowerCase()) ? 'success' : 'danger');
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

return Backbone.View.extend({
        initialize: function() {
            console.log('monitor init');
            this.el = $('.container');
            var wrapper = require('wrapper');
            
            wrapper.updateMenu('index');

            this.rating = this.el.find("#monitor-user-rating");
            this.answers = this.el.find("#monitor-list-answers");

            var Rating = require('collections/rating'); //new App.Collections.ListUserRating();
            var LastAnswers = require('collections/answers'); //new App.Collections.ListLastAnswers();

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
            console.log('destructTimer');
            clearInterval(this.timerRating);
            clearInterval(this.timerLastAnswer);
        },
        // For debug
        tryCatch: function (str) {
           console.log(str);
        },
        addOneRating: function(rating) {
            var view = new monitorRating({model: rating, id: 'rating-user-'+rating.get('id')});

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
            var view = new monitorAnswers({model: answer});
            this.answers.prepend(view.render().el);
        }
    });
});