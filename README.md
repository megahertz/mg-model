# mg-model
Simple and lightweight angular model library

# Requirements
ES5.1 compatible browser(IE9+ and all modern browsers)

# Installation

#### Install with Bower
```sh
$ bower install mg-model
```

#### Install with NPM

```sh
$ npm install mg-model
```

# Examples

#### Simple Model
```js
// user.model.js:
angular.module('app.models').factory('UserModel', function(ngModel) {
    return mgModel.extend({
        // These fields don't need to be declared explicitly
        firstName: null,
        lastName: null,
        getName: function() {
            return this.firstName + ' ' + this.lastName;
        },
        $collection: ngModel.$collection.extend({
            getByName: function(name) {
                return this.oneExp('$model.name == value', name)
            },
            mapNames: function() {
                return this.map(function(model) { return model.getName() };
            }
        });
    });    
});

// user.controller.js
function UserController(UserModel, $http) {
    var vm = this;
    UserModel.$collection.load($http('/users').then(function(collection) {
        vm.john = collection.getByName('John');
        vm.usersCount = collection.length;
        vm.names = collection.mapNames();
    });
}
```

#### Inheritance

```js
// animal.model.js:
angular.module('app.models').factory('AnimalModel', function(ngModel) {
    return mgModel.extend({
        say: function() {
            throw 'Not implemented';
        }
    });
});    
    
// animal.model.js:
angular.module('app.models').factory('DogModel', function(AnimalModel) {
    return AnimalModel.extend({
        say: function() {
            return 'woof';
        }
    });
});    
```

#### Properties
angular.module('app.models').factory('UserModel', function(ngModel) {
    return mgModel.extend({
        firstName: null,
        lastName: null,
        $properties: {
            name: {
                get: function() {
                    return this.firstName + ' ' + this.lastName;
                }
            }
        }
    });
});


# API Documentation
mgModel service returns a BaseModel instance

## BaseModel

#### Properties

Properties are just a simple fields of a model or properties defined through $properties config

#### Methods
Name                | Description
--------------------|------------
constructor(data)   | Constructor which applies data to itself
on(event, handler)  | Attach a handler on the event.
emit(event, data)   | Emit the event
getIdField():string | Return a name of an id field (default id)
getId():Object      | Return a value of an id field

#### Static
Name            | Description
----------------|------------
$collection     | A collection class for this model
extend(members) | Extend a current model. Returns a new model class

#### Configs
Configs are set when a model class is created by an extend() method
Name        | Description
------------|------------
$collection | A collection class for this model
$properties | Define model properties using Object.defineProperty


## BaseCollection (extends Array)

#### Properties

There is only length property which is inherited from the Array class

#### Methods
Name                                        | Description
--------------------------------------------|------------
constructor(data, prepare=false)            | Constructor which calls append() method
on(event, handler)                          | Attach a handler on the event.
emit(event, data)                           | Emit the event
each(iterator)                              | A shortcut for forEach() method
append(array, prepare=false):this           | Appends records, wrap each record to a $model class if necessary. If prepare=true pass the data through prepare() method
appendResource(resource):Promise            | Loads data from promise and call append(data, true) when finish
filterExp(expression, scope):BaseCollection | Like filter() but evaluate an expression instead of iterator. See the 'Simple Model' example
oneExp(expression, scope):BaseCollection    | Like filterExp() but returns only first item
byId(id):BaseModel                          | Find record by calling getId() on each
toObject():Object                           | Return Object keyed by id

#### Static
Name                           | Description
-------------------------------|------------
$model                         | A model class for this collection
extend(members)                | Extend a current class. Returns a new collection class
load(data)                     | Return a new instance filled by data
loadResource(resource):Promise | Return a new instance wrapped to a promise and filled by the resource

## License

Licensed under MIT.