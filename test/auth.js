const { expect } = require('chai');
const should = require('chai').should();
const sinon = require('sinon');
const request = require('supertest');

const app = require('../app');


describe('POST /auth/signup', function () {

    it('returns 422 if email is not privided', function (done) {
        request(app)
            .post('/auth/signup')
            .send({
                data: {
                    attributes: {
                        email: '',
                        password: 'password',
                        confirmPassword: 'password',
                    }
                }
            })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(422, done);
    });

    it('returns 422 if password is not privided', function (done) {
        request(app)
            .post('/auth/signup')
            .send({
                data: {
                    attributes: {
                        email: 'some@mail.com',
                        password: '',
                        confirmPassword: '',
                    }
                }
            })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(422, done);
    });

    it('returns 422 if passwords do not match', function (done) {
        request(app)
            .post('/auth/signup')
            .send({
                data: {
                    attributes: {
                        email: 'some@mail.com',
                        password: 'password',
                        confirmPassword: 'drowssap',
                    }
                }
            })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(422, done);
    });

    it('returns 204 if user got registered', function (done) {

        request(app)
            .post('/auth/signup')
            .send({
                data: {
                    attributes: {
                        email: 'some@mail.com',
                        password: 'password',
                        confirmPassword: 'password'
                    }
                }
            })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect(204, done);
    });

});

describe('POST /auth/login', function () {

    it('returns 204 if login is successful', function (done) {
        request(app)
            .post('/auth/login')
            .send({ data: { attributes: { email: 'some@mail.com', password: 'password' } } })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end((err, res) => {
                if (err) done(err);

                expect(res.body.data.type).to.be.equal('jwt bearer token');
                expect(res.body.data.id).to.be.an('string');
                return done();
            });
    });

    it('returns 401 if user was not found', function (done) {
        request(app)
            .post('/auth/login')
            .send({ data: { attributes: { email: 'nonexistent@mail.com', password: 'password' } } })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(401, done);
    });

    it('returns 422 if email is not privided', function (done) {
        request(app)
            .post('/auth/login')
            .send({ data: { attributes: { email: '', password: 'password' } } })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(422, done);
    });

    it('returns 422 if password is not privided', function (done) {
        request(app)
            .post('/auth/login')
            .send({ data: { attributes: { email: 'some@mail.com', password: '' } } })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(422, done);
    });

});
