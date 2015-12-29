'use strict';

(function() {
    angular
        .module('mgmodel', [])
        .factory('mgModel', mgModel);

    /**
     * @ngInject
     */
    function mgModel($q, $parse) {
        var Model = createBaseModel();
        Model.$collection = createBaseCollection(Model, $q, $parse);
        return Model;
    }

    function extend(members) {
        /* jshint -W040 */
        var $collection = this.$collection;
        var self = this;

        if (members.$collection) {
            $collection = members.$collection;
            delete members.$collection;
        }

        function construct() {
            self.apply(this, arguments);
        }

        var Class = members.constructor === Object ? construct : members.constructor;
        Class.prototype = Object.create(this.prototype);
        angular.extend(Class, this);
        angular.extend(Class.prototype, members);
        Class.prototype.constructor = Class;

        if ($collection) {
            $collection.$model = Class;
            Class.$collection = $collection;
        }

        return Class;
    }

    function createBaseModel() {
        function BaseModel(data) {
            angular.extend(this, data);
        }

        BaseModel.prototype.getIdField = function () {
            return 'id';
        };

        BaseModel.prototype.getId = function () {
            return this[this.getIdField()];
        };

        BaseModel.extend = extend;

        return BaseModel;
    }

    function createBaseCollection(BaseModel, $q, $parse) {
        function BaseCollection(data) {
            if (!data) {
                return;
            }
            if (!(data instanceof Array)) {
                throw 'Collection accepts only Array';
            }
            var Model = this.constructor.$model || BaseModel;

            this.push.apply(this, data.map(function (record) {
                return new Model(record);
            }));
        }

        BaseCollection.prototype = Object.create(Array.prototype);
        BaseCollection.prototype.filterExp = function filterExp(expression, scope) {
            var exp = $parse(expression);
            var result = this.filter(function (model) {
                if (!angular.isObject(scope)) {
                    scope = {value: scope};
                }
                scope.$model = model;
                return exp(scope);
            });
            return new this.constructor(result);
        };
        BaseCollection.prototype.oneExp = function filterExp(expression, scope) {
            return this.filterExp(expression, scope)[0];
        };

        BaseCollection.load = function load(resource) {
            var Self = this;
            var promise = resource.then ? resource : $q.when(resource);

            return promise.then(function (records) {
                return new Self(records);
            });
        };

        BaseCollection.extend = extend;
        BaseCollection.$model = BaseModel;

        return BaseCollection;
    }
})();