import { Controller } from '@infect/rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class MappingController extends Controller {


    constructor({
        configuration,
    }) {
        super('mapping');

        // service wide configurations received by the cluster 
        // service
        this.configuration = configuration;
        this.enableAction('create');
    }




    /**
    * process the data of the currently loaded data set with
    * the function specified in the request body
    */
    async create(request) {
        const data = await request.getData();

        if (!data) request.response().status(400).send(`Missing request body!`);
        else if (!type.object(data)) request.response().status(400).send(`Request body must be a json object!`);
        else if (!type.string(data.functionName)) request.response().status(400).send(`Missing parameter or invalid 'functionName' in request body!`);
        else {
            if (!this.configuration.get('sourceCode').has(data.functionName)) throw new Error(`Cannot process data using the '${data.functionName}' function, it doesn't exist!`);
            else {
                const mapper = this.configuration.get('sourceCode').get(data.functionName).mapper;
                const rows = this.configuration.get('dataSet').getValues();
                const params = data.parameters;
                return await mapper.compute({rows, params});
            }
        }
    }
}