import Controller from './Controller';

export default class CrudController {
  constructor(resourceContext, service, args) {
    this.findLimit = args && args.findLimit ? args.findLimit : 20;
    this.pageSize = args && args.pageSize ? args.pageSize : 30;
    this.searchFields = args && args.searchFields ? args.searchFields : ['name'];
    this.sortFields = args && args.sortFields ? args.sortFields : { 'name': 1 };
    this.resourceContext = resourceContext;
    this.service = service;
  }
  buildFilter(search) {
    if (!this.searchFields && !search)
      return null;
    let filter = { $or: [] };
    this.searchFields.forEach((field, i) => {
      let filterOption = {};
      filterOption[field] = { $regex: '.*' + search + '.*', $options: 'i' };
      filter.$or.push(filterOption);
    });
    return filter;
  }
  buildSort() {
    if (!this.sortFields)
      return null;
    return this.sortFields;
  }
  get controllers() {
    return Controller.create(this.resourceContext)
      // Page service data
      .handle({ route: '/page/:pageNo', method: 'get', produces: 'json' }, (req, res) => {
        this.service.page({
          filter: this.buildFilter(req.query.search),
          sort: this.buildSort(),
          pageNo: req.params.pageNo,
          pageSize: req.query.pagesize ? req.query.pagesize : pageSize
        }, (pagedData) => {
          res.json(pagedData);
        });
      })
      // Find many service data
      .handle({ route: '/', method: 'get', produces: 'json' }, (req, res) => {
        this.service.findMany({
          filter: this.buildFilter(req.query.search),
          sort: this.buildSort(),
          limit: findLimit
        }, (objs) => {
          res.json(objs);
        });
      })
      // Create service data
      .handle({ route: '/', method: 'post', produces: 'json', consumes: 'json' }, (req, res) => {
        this.service.create({
          data: req.body
        }, (obj) => {
          res.json(obj);
        });
      })
      // Find single service data
      .handle({ route: '/:uuid', method: 'get', produces: 'json' }, (req, res) => {
        this.service.findOne({
          filter: req.params.uuid,
          sort: this.buildSort(),
          limit: this.findLimit
        }, (obj) => {
          res.json(obj);
        });
      })
      // Update service data
      .handle({ route: '/:uuid', method: 'put', produces: 'json', consumes: 'json' }, (req, res) => {
        this.service.update({
          data: req.body,
          filter: req.params.uuid
        }, (obj) => {
          res.json(obj);
        });
      })
      // Delete service data
      .handle({ route: '/:uuid', method: 'delete', produces: 'json', consumes: 'json' }, (req, res) => {
        this.service.delete({
          filter: req.params.uuid
        }, (obj) => {
          res.json(obj);
        });
      });
  }
}
