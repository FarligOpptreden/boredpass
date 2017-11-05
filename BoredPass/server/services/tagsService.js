import config from '../../config';
import { BasicCrud } from '../../handlr/_all';

class Tags extends BasicCrud {
  constructor() {
    super(config.connectionStrings.boredPass, 'tags');
  }
}

export const TagsService = new Tags();