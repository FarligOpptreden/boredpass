import { ActivitiesService } from './_all';

class Default {
    constructor() { }

    recommendedActivities(args) {
        ActivitiesService.page({
            pageNo: args.pageNo,
            pageSize: 20,
            sort: { _created: -1 }
        }, args.callback);
    };
}

export const DefaultService = new Default();