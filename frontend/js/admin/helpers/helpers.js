/**
 * Created by shipko on 05.09.15.
 */

define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
    Form = Backbone.View.extend({
        events: {
            'click .btn-success': 'submit'
        },

        initialize: function(element, template_id, submitCallback) {
            this.$el = element;
            this.submitCallback = submitCallback;

            this.template = _.template($('#'+template_id).html());
        },

        submit: function() {
            this.submitCallback();
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    return {
        form: Form
    }
});