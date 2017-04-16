import ActivitiesService from './activities';

class Default {
    constructor() { }
    recommendedActivities(args) {
        ActivitiesService.page(
            null,
            { _created: -1 },
            args.pageNo,
            20,
            args.callback);
    };
}

export default new Default();