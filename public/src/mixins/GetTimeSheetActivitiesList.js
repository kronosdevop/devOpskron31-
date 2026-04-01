import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    get_activities
} from "@/graphql/queries.js";

export const get_activities_list = {
    data: () => ({
        ActivityList: [],

    }),
    methods: {
        async get_activities_list() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(get_activities, {
                        input: {
                            organization_id: data.organization.organization_id,
                        },
                    })
                );
                this.ActivityList = [];
                var response = JSON.parse(result.data.get_activities);
                if (response.Status == "SUCCESS") {
                    this.ActivityList = response.data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}