# mg-model
Simple and lightweight angular model library

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
        // The fields don't need to be declared explicitly
        id: null,
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
