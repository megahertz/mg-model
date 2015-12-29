describe('Model', function() {

    var UserModel;
    var mgModel;

    beforeEach(function() {
        module('mgmodel');
    });

    beforeEach(inject(function(_mgModel_) {
        mgModel = _mgModel_;
        UserModel = mgModel.extend({
            id: null,
            firstName: null,
            lastName: null,
            constructor: function() {
                this.email = 'test@example.com';
                mgModel.apply(this, arguments);
            },
            getName: function() {
                return this.firstName + ' ' + this.lastName;
            }
        });
    }));

    it('should be created', function() {
        var model = new UserModel();
        expect(model.firstName).toBe(null);
        expect(model.email).toBe('test@example.com');
        expect(model.getId()).toBe(null);
        expect(model.constructor.$collection).toBe(mgModel.$collection);
    });

    it('should store values', function() {
        var model = new UserModel({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
        });
        expect(model.firstName).toBe('John');
        expect(model.email).toBe('john@example.com');
        expect(model.getId()).toBe(1);
        expect(model.getName()).toBe('John Doe');
    });
});