describe('Collection', function() {

    var UserModel;
    var $rootScope;

    var data = [
        {id: 1, name: 'User1'},
        {id: 2, name: 'User2'},
        {id: 3, name: 'User3'}
    ];

    beforeEach(function() {
        module('mgmodel');
    });

    beforeEach(inject(function(mgModel, _$rootScope_) {
        $rootScope = _$rootScope_;
        UserModel = mgModel.extend({
            id: null,
            name: null,
            /**
             * @class UserCollection
             * @type UserCollection
             * @extend BaseCollection
             */
            $collection: mgModel.$collection.extend({
                getAllByName: function(name) {
                    return this.filterExp('$model.name == value', name)
                },
                getByName: function(name) {
                    return this.oneExp('$model.name == value', name)
                }
            })
        });
    }));

    it('should be created', function() {
        var collection = new UserModel.$collection();
        expect(collection instanceof UserModel.$collection).toBeTruthy();
    });

    it('should load data', function() {
        var collection = createCollection();

        expect(collection instanceof UserModel.$collection).toBeTruthy();
        expect(collection.length).toBe(3);
        expect(collection[0] instanceof UserModel).toBeTruthy();
    });

    it('should filter by expression', function() {
        var collection = createCollection();
        var results = collection.getAllByName('User2');
        expect(results instanceof UserModel.$collection).toBeTruthy();
        expect(results[0].getId()).toBe(2);
        expect(collection.getByName('User2').getId()).toBe(2);
    });

    /**
     * @returns {UserCollection}
     */
    function createCollection() {
        var collection;
        UserModel.$collection.load(data).then(function(result) {
            collection = result;
        });
        $rootScope.$digest();
        return collection;
    }
});