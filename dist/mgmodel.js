'use strict';

(function() {
    angular
        .module('mgmodel', [])
        .factory('mgModel', mgModel);

    /**
     * @ngdoc service
     * @name mgModel
     * @module mgModel
     * @description
     * Simple and lightweight angular model library
     * @return BaseModel
     * @ngInject
     */
    function mgModel($q, $parse) {
        var Model = createBaseModel();
        Model.$collection = createBaseCollection(Model, $q, $parse);
        return Model;
    }

    /**
     * Simple OOP implementation
     * @param {Object} members
     * @return {Function}
     */
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

        BaseCollection.prototype.append = function append(data) {
            if (!data) {
                return;
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
        };

        BaseCollection.prototype.appendResource = function appendResource(resource) {
            var self = this;
            return resource.then(function(records) {
                self.append(records);
                return self;
            });
        };

        BaseCollection.prototype.filterExp = function filterExp(expression, scope) {
            var exp = $parse(expression);
            var result = this.filter(function(model) {
                if (!angular.isObject(scope)) {
                    scope = {value: scope};
                }
                scope.$model = model;
                return exp(scope);
            });
            return new this.constructor(result);
        };
        BaseCollection.prototype.oneExp = function oneExp(expression, scope) {
            return this.filterExp(expression, scope)[0];
        };

        /**
         * Create a collection filled by data
         * @param {Array} [data]
         * @returns {this}
         */
        BaseCollection.load = function load(data) {
            return new this(data);
        };

        /**
         * Create a collection filled by resource
         * @param {Promise} resource
         * @returns {Promise.<this>}
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