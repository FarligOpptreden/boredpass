import config from '../../config';
import { BasicCrud } from '../../handlr/_all';

class Listings extends BasicCrud {
    constructor() {
        super(config.connectionStrings.boredPass, 'listings');
    }

    statistics(callback) {
        this.aggregate({
            pipeline: [
                {
                    unwind: '$tags'
                },
                {
                    group: {
                        _id: '$tags.name',
                        count: { $sum: 1 }
                    }
                },
                {
                    sort: {
                        _id: 1
                    }
                }
            ]
        }, callback);
    }
}

export const ListingsService = new Listings();