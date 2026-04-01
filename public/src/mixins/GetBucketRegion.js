import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_master_buckets_regions
} from "@/graphql/queries.js";

export const get_s3_regions = {
    data: () => ({
        listRegions: [],
       
    }),
    methods: {
        async get_s3_regions() {
           
            try {
                let result = await API.graphql(
                  graphqlOperation(list_master_buckets_regions, {
                    
                  })
                );
                this.listRegions =[];
                var response = JSON.parse(result.data.list_master_buckets_regions);
                 this.listRegions = response.details[0].master_regions;
                 
               
               
              } catch (error) {
                this.listRegions =[];
                 
              }
        },
    }
}