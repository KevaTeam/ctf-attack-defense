define(['underscore', 'backbone'], function(_, Backbone) {
    var model = Backbone.Model.extend({});

    var collection = Backbone.Collection.extend({
        url: 'quest.getAttempts',

        model: model,

        parse: function(response) {
            return _.map(response, function(num, key) {
                // Делаем нумерацию рейтинга
                num['id'] = num['user']+'_'+num['quest']['id']+'_'+num['time'];
                return num;
            });
        }
    });

    return new collection();
});