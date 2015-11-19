define(['underscore', 'backbone'], function(_, Backbone) {
	var model = Backbone.Model.extend({});
    var collection = Backbone.Collection.extend({
        url: 'user.list',

        model: model,

        parse: function(response) {
            return _.map(response.items, function(num, key) {
                // Делаем нумерацию рейтинга
                num['position'] = key + 1;
                return num;
            });
        }
    });

    return new collection();
});