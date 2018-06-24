import config from '../../config';
import { BasicCrudPromises, konsole } from '../../handlr/_all';

class Tags extends BasicCrudPromises {
    constructor() {
        super(config.connectionStrings.boredPass, 'tags');
    }

    uniqueCategories() {
        return new Promise((resolve, reject) => {
            this.aggregate({
                pipeline: [
                    {
                        unwind: '$categories'
                    },
                    {
                        group: {
                            _id: '$categories',
                            tags: { $addToSet: '$name' }
                        }
                    },
                    {
                        project: {
                            category: '$_id',
                            tags: 1
                        }
                    },
                    {
                        sort: {
                            category: 1
                        }
                    }
                ]
            })
                .then(d => resolve(d))
                .catch(err => {
                    konsole.error(err.toString());
                    reject(err.toString());
                });
        });
    }

    tagsPerCategory(category) {
        return new Promise((resolve, reject) => {
            this.findMany({
                filter: {
                    categories: category
                }
            })
                .then(d => resolve(d))
                .catch(err => {
                    konsole.error(err.toString());
                    reject(err.toString());
                });
        });
    }
}

export const TagsService = new Tags();