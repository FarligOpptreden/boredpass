import { ActivitiesService } from '../../../services/_all';
import { CrudController } from '../../../../handlr/_all';

export default new CrudController(
  '/api/v1/activities',
  ActivitiesService,
  {
    searchFields: ['name', 'location'],
    sortFields: { '_created': -1, 'name': 1 }
  }
).controllers;