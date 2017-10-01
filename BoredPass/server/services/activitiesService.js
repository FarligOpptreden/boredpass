import config from '../../config';
import { BasicCrud } from '../../handlr/_all';

class Activities extends BasicCrud {
  constructor() {
    super(config.connectionStrings.boredToday, 'activities');
  }
}

export const ActivitiesService = new Activities();