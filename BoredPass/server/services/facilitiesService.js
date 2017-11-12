import config from '../../config';
import { BasicCrud } from '../../handlr/_all';

class Facilities extends BasicCrud {
  constructor() {
    super(config.connectionStrings.boredPass, 'facilities');
  }
}

export const FacilitiesService = new Facilities();