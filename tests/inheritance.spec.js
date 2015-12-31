describe('extend method', function() {

    var mgModel;
    var $rootScope;


    beforeEach(function() {
        module('mgmodel');
    });

    beforeEach(inject(function(_mgModel_, _$rootScope_) {
        mgModel = _mgModel_;
        $rootScope = _$rootScope_;
    }));


    describe('constructor', function() {
        it('should create models with the same logic', function() {
            var Model = mgModel.extend({
                name: 'simple'
            });
            var ModelWithConstructor = mgModel.extend({
                constructor: function() {
                    mgModel.apply(this, arguments);
                    this.name = 'constructor';
                }
            });

            [Model, ModelWithConstructor].forEach(function(Mdl) {
                var model = new Mdl();
                expect(model.constructor).toBe(Mdl);
                expect(Mdl.$collection).toBe(mgModel.$collection);
                expect(model.constructor.$collection).toBe(mgModel.$collection);
            });

            expect((new Model()).name).toBe('simple');
            expect((new ModelWithConstructor()).name).toBe('constructor');
        });

        it('should call default', function() {
            var Model = mgModel.extend({
                name: 'simple'
            });
            var model = new Model({name: 'test default'});
            expect(model.name).toBe('test default');
        });
    });

    it('should create valid inheritors', function() {
        var Parent = mgModel.extend({
            name: 'parent',
            whoAmI: function() {
                return 'I am a ' + this.name;
            },
            constructor: function() {
                mgModel.apply(this, arguments);
            }
        });
        var Child = Parent.extend({
            name: 'child',

            getFullName: function() {
                return this.name + ' ' + Parent.prototype.name;
            }
        });

        var parent = new Parent();
        expect(parent.whoAmI()).toBe('I am a parent');

        var child = new Child();
        expect(child.whoAmI()).toBe('I am a child');
        expect(child.getFullName()).toBe('child parent');
        expect(child instanceof Parent).toBe(true);
        expect(parent instanceof Child).toBe(false);
    });

    it('should create classes with on/emit', function() {
        var Model = mgModel.extend({
            name: 'simple',
            setName: function(name) {
                this.$emit('change-name', name);
                this.name = name;
            }
        });
        var changed;

        var model = new Model();
        model.$on('change-name', function(e, value) {
            changed = value;
        });
        model.setName('test');
        $rootScope.$digest();

        expect(model.name).toBe('test');
        expect(changed).toBe('test');
    });

    it('should create class with properties support', function() {
        var Model = mgModel.extend({
            $properties: {
                value: {
                    get: function() {
                        return this._value;
                    },
                    set: function(value) {
                        value = Math.min(Math.max(value, 0), 100);
                        this._value = value;
                    }
                }
            }
        });
        var model = new Model({ value: 150 });
        expect(model.value).toBe(100);

        model.value = -1;
        expect(model.value).toBe(0);

        model.value = 5;
        expect(model.value).toBe(5);
    });
});