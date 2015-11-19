define(['jquery', 'backbone'], function($, Backbone) {
	var view = Backbone.View.extend({
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

	return new view();
});