import config from '../../config';
import { BasicCrud } from '../../handlr/_all';

class Listings extends BasicCrud {
  constructor() {
    super(config.connectionStrings.boredPass, 'listings');
  }
}

export const ListingsService = new Listings();