import * as request from 'supertest';
import mm from 'egg-mock';
import * as assert from 'assert';

describe('test/lib/route.test.js', () => {
  let app: any;
  before(() => {
    app = mm.app({
      baseDir: 'example',
      customEgg: true,
    } as any);
    return app.ready();
  });

  after(() => app.close());

  afterEach(mm.restore);

  it('should GET /home/index', () => {
    return request(app.callback())
      .get('/home/index')
      .expect('homeIndex')
      .expect(200);
  });

  it('should GET /home/sort', () => {
    return request(app.callback())
      .get('/home/sort')
      .expect('homeSort')
      .expect(200);
  });

  it('should POST /home/post', () => {
    return request(app.callback())
      .post('/home/post')
      .send({ param: { id: 123 } })
      .expect(200)
      .then(res => {
        assert.deepEqual(res.body, { id: 123 });
      });
  });

  it('should PUT /home/put', () => {
    return request(app.callback())
      .put('/home/put')
      .send({ id: 123 })
      .expect(200)
      .then(res => {
        assert(res.body === 123);
      });
  });

  it('should GET /home/default', () => {
    return request(app.callback())
      .get('/home/default')
      .expect(200)
      .expect('ok');
  });

  it('should GET /home/nodata', () => {
    return request(app.callback())
      .get('/home/nodata')
      .expect(204);
  });

  it('should GET /notfound', () => {
    return request(app.callback())
      .get('/notfound')
      .expect(404);
  });

});

