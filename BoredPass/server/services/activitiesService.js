import config from '../../config';
import { BasicCrudPromises } from '../../handlr/_all';

class Activities extends BasicCrudPromises {
    constructor() {
        super(config.connectionStrings.boredPass, 'activities');
    }
}

export const ActivitiesService = new Activities();