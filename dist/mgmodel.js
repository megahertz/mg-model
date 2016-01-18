'use strict';

(function() {
    angular
        .module('mgmodel', [])
        .factory('mgModel', mgModel);

    mgModel.$inject = ['$q', '$parse', '$rootScope'];
    /**
     * @ngdoc service
     * @name mgModel
     * @module mgModel
     * @description
     * Simple and lightweight angular model library
     * @return BaseModel
     * @ngInject
     */
    function mgModel($q, $parse, $rootScope) {
        var Model = createBaseModel();
        Model.$collection = createBaseCollection(Model, $q, $parse);

        Model.prototype.$on   = Model.$collection.prototype.$on   = $on;
        Model.prototype.$emit = Model.$collection.prototype.$emit = $emit;

        return Model;

        function $on(event, handler) {
            /* jshint -W040 */
            this.scope = this.scope || $rootScope.$new();
            this.scope.$on(event, handler);
            return this;
        }

        function $emit(event, data) {
            /* jshint -W040 */
            if (this.scope) {
                this.scope.$emit(event, data);
            }
        }
    }

    /**
     * Simple OOP implementation
     * @param {Object} members
     * @return {Function}
     */
    function extend(members) {
        /* jshint -W040 */
        var $collection = this.$collection;
        var $properties = this.$properties;
        var self = this;

        if (members.$collection) {
            $collection = members.$collection;
            delete members.$collection;
        }
        if (members.$properties) {
            $properties = members.$properties;
            delete members.$properties;
        }

        function construct() {
            self.apply(this, arguments);
        }

        var Class = members.constructor === Object ? construct : members.constructor;
        Class.prototype = Object.create(this.prototype, $properties);
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
        /**
         * @class BaseModel
         * @param {Object} [data]
         * @constructor
         */
        function BaseModel(data) {
            angular.extend(this, data);
        }

        BaseModel.prototype.getIdField = function getIdField() {
            return 'id';
        };

        BaseModel.prototype.getId = function getId() {
            return this[this.getIdField()];
        };

        /**
         * @memberof BaseModel
         * @method BaseModel.extend
         * @static
         * @return BaseModel
         */
        BaseModel.extend = extend;

        return BaseModel;
    }

    function createBaseCollection(BaseModel, $q, $parse) {
        /**
         * @class BaseCollection
         * @param {Array} data
         * @constructor
         */
        function BaseCollection(data) {
            this.append(data);
        }

        BaseCollection.prototype = Object.create(Array.prototype);

        BaseCollection.prototype.each = BaseCollection.prototype.forEach;

        BaseCollection.prototype.append = function append(data) {
            if (!data) {
                return this;
            }

            if (!(data instanceof Array)) {
                throw 'Collection accepts only Array';
            }

            var Model = this.constructor.$model || BaseModel;

            this.push.apply(this, data.map(function(record) {
                if (!(record instanceof Model)) {
                    record = new Model(record);
                }
                return record;
            }));

            return this;
        };

        BaseCollection.prototype.convertData = function convertData(data) {
            return data;
        };

        BaseCollection.prototype.appendResource = function appendResource(resource) {
            var self = this;
            return resource.then(function(records) {
                self.append(self.convertData(records));
                return self;
            });
        };

        BaseCollection.prototype.filterExp = function filterExp(expression, scope) {
            var exp = $parse(expression);
            return this.filter(function(model) {
                if (!angular.isObject(scope)) {
                    scope = {value: scope};
                }
                scope.$model = model;
                return exp(scope);
            });
        };

        BaseCollection.prototype.oneExp = function oneExp(expression, scope) {
            return this.filterExp(expression, scope)[0];
        };

        BaseCollection.prototype.byId = function byId(id) {
            var result = this.filter(function(model) {
                return model.getId() === id;
            });
            return result[0];
        };

        BaseCollection.prototype.toObject = function toObject() {
            var obj = {};
            this.each(function(model) {
                obj[model.getId()] = model;
            });
            return obj;
        };

        // Wrap Array methods to return BaseCollection instance instead
        var arrayMethods = [
            'reverse', 'sort', 'filter', 'map', 'copyWithin', 'fill', 'concat'
        ];
        arrayMethods.forEach(function(property) {
            if (!Array.prototype[property]) {
                return;
            }

            BaseCollection.prototype[property] = function() {
                var result = Array.prototype[property].apply(this, arguments);
                return new this.constructor(result);
            };
        });

        /**
         * Create a collection filled by data
         * @param {Array} [data]
         * @return {*}
         */
        BaseCollection.load = function load(data) {
            var record = new this();
            record.append(record.convertData(data));
            return record;
        };

        /**
         * Create a collection filled by resource
         * @param {Promise} resource
         * @return {Promise.<this>}
         */
        BaseCollection.loadResource = function loadResource(resource) {
            var collection = this.load();
            return collection.appendResource(resource);
        };

        BaseCollection.extend = extend;
        BaseCollection.$model = BaseModel;

        return BaseCollection;
    }
})();