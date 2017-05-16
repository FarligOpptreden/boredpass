import config from '../../config';
import BasicCrud from '../../handlr/BasicCrud';

export default new BasicCrud(config.connectionStrings.boredToday, 'activities');